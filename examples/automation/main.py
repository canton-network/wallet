import uuid
import json
import asyncio
import aiohttp
from aiohttp_sse_client import client as sse_client
from datetime import datetime

DAPP_URL = "http://localhost:3030/api/v0/dapp"
API_KEY = "8e011a78cdd52d0aaf075328e1d8d448171ba514fcdb96e3595b2cac32bd37ed"
SUBMITTER = "demo::12201745ba50f6500e4d4c1dd2396a206db1f9cd878eed7b5d4f2d737c8dc1c2e4a0"

async def json_rpc_request(session, method, params=None, api_key=None):
    """Make an async JSON-RPC request to the dApp API with the appropriate auth header."""
    headers = {}
    if api_key:
        headers["Authorization"] = f"ApiKey {api_key}"

    body = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params or {},
    }

    async with session.post(DAPP_URL, json=body, headers=headers) as response:
        return await response.json()


async def events(api_key, tracked_ids):
    """Listen for events and filter by type and commandId."""
    headers = {}
    if api_key:
        headers["Authorization"] = f"ApiKey {api_key}"

    # Correct usage of aiohttp_sse_client with an async context manager
    async with sse_client.EventSource(f"{DAPP_URL}/events", headers=headers) as event_source:
        async for event in event_source:
            # 1. Filter by event type
            if event.type == "txChanged":
                try:
                    # 2. Parse the JSON array string
                    payload = json.loads(event.data)

                    if payload and isinstance(payload, list):
                        event_command_id = payload[0].get("commandId")

                        # 3. Check if it matches an ID we generated
                        if event_command_id in tracked_ids:
                            status = payload[0].get("status")
                            print(f"\n➔ MATCH: Event for command {event_command_id} | Status: {status}")

                except json.JSONDecodeError:
                    # Ignore malformed JSON in the stream
                    continue


async def list_accounts(session):
    """Call 'listAccounts' method on the dApp API and return the response."""
    return await json_rpc_request(session, "listAccounts", api_key=API_KEY)


async def get_primary_account(session):
    """Call 'getPrimaryAccount' method on the dApp API and return the response."""
    response_data = await json_rpc_request(session, "getPrimaryAccount", api_key=API_KEY)

    partyId = response_data.get("result", {}).get("partyId", "")
    if not partyId:
        raise Exception("No partyId found in response")

    return partyId


async def prepare_execute(session, commands, party, command_id):
    """Call 'prepareExecute' method on the dApp API with the given commands and party."""
    response_data = await json_rpc_request(session, "prepareExecute", {
        "commands": commands,
        "actAs": [party],
        "commandId": command_id
    }, api_key=API_KEY)

    return response_data


def ping_create_command(party):
    """Construct a ping create command for the given party. (Remains synchronous)"""
    templateId = '#canton-builtin-admin-workflow-ping:Canton.Internal.Ping:Ping'

    return [
        {
            "CreateCommand": {
                "templateId": templateId,
                "createArguments": {
                    "id": f"my-test-{datetime.now().isoformat()}",
                    "initiator": party,
                    "responder": party,
                },
            },
        },
    ]


async def submit_ping_transaction(session, party, tracked_ids):
    """Submit a ping transaction for the given party."""

    # 1. Generate client-side command ID
    command_id = str(uuid.uuid4())
    print(f"\nGenerated commandId for ping: {command_id}")

    # 2. Add it to the shared tracking set so the listener looks for it
    tracked_ids.add(command_id)

    # 3. Generate the command and submit it
    ping_command = ping_create_command(party)
    result = await prepare_execute(session, ping_command, party, command_id)

    userUrl = result.get("result", {}).get("userUrl")
    if not userUrl:
        print("prepareExecute failed (did not return userUrl). Result:", result)

    print(f"\nSubmitted ping transaction succesfully as party '{party}'.")


async def main():
    if not API_KEY:
        print("Please create an API_KEY in the Wallet Gateway before running")
        return

    # Create a shared set to track command IDs
    tracked_ids = set()

    # 1. Start the event listener in the background with the shared set of tracked command IDs
    listener_task = asyncio.create_task(events(api_key=API_KEY, tracked_ids=tracked_ids))

    # 2. Yield control briefly to ensure the listener connects before we trigger events
    await asyncio.sleep(0.5)

    # 3. Create an aiohttp ClientSession to use for our RPC calls
    async with aiohttp.ClientSession() as session:

        accounts = await list_accounts(session)
        print(f"All wallet accounts:\n{json.dumps(accounts, indent=2)}")

        primary_party = await get_primary_account(session)
        print(f"\nCurrent primary party: {primary_party}")

        await submit_ping_transaction(session, SUBMITTER, tracked_ids)

    # 4. Keep the script running to catch the stream of events
    # (If the stream is endless, this will run endlessly until you interrupt with Ctrl+C)
    await listener_task


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nProcess interrupted by user. Shutting down...")
