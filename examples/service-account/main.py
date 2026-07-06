import requests
from datetime import datetime

API_KEY = ""
SUBMITTER = "alex5::12204b83b5e0d1fac1c2b42a6228615a44e2e782f503a9c3e4841eeb01ee6fb5fde4"

def json_rpc_request(path, method, params=None, apiKey=None):
    headers = {}
    if apiKey:
        headers["Authorization"] = f"ApiKey {apiKey}"

    body = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params or {},
    }

    return requests.post(f"http://localhost:3030/api/v0/{path}", json=body, headers=headers)

def list_accounts():
    print("Listing accounts...")

    response = json_rpc_request("dapp", "listAccounts", apiKey=API_KEY)
    print("Accounts:", response.text)

    return

def get_primary_account():
    response = json_rpc_request("dapp", "getPrimaryAccount", apiKey=API_KEY)
    partyId = response.json().get("result", {}).get("partyId", "")
    if not partyId:
        raise Exception("No partyId found in response")

    return partyId

def prepare_execute(commands, party):
    response = json_rpc_request("dapp", "prepareExecute", { "commands": commands, "actAs": [party] }, apiKey=API_KEY)
    print("Prepare execute response:", response.text)

    return response

def ping_create_command(party):
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


def main():
    if not API_KEY:
        print("Please create an API_KEY in the Wallet Gateway before running")
        return

    list_accounts()
    primaryParty = get_primary_account()

    print("\nReceived primary party: ", primaryParty)

    pingCommand = ping_create_command(SUBMITTER)

    prepared = prepare_execute(pingCommand, SUBMITTER)
    userUrl = prepared.json().get("result", {}).get("userUrl")
    print("Received userUrl: ", userUrl)

    # extract transactionId from userUrl query params
    from urllib.parse import urlparse, parse_qs
    parsedUrl = urlparse(userUrl)
    queryParams = parse_qs(parsedUrl.query)
    transactionId = queryParams.get("transactionId", [None])[0]
    if not transactionId:
        print("No transactionId found in userUrl")
        return

    print("Received transactionId: ", transactionId)

if __name__ == "__main__":
    main()
