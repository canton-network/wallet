import requests
from datetime import datetime

API_KEY = "4eb780fd6d6962d9d4048c569484a1b7c7e342eb953d0ae5888d7c1d4f4f4380"

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

def prepare_execute(commands):
    response = json_rpc_request("dapp", "prepareExecute", { "commands": commands }, apiKey=API_KEY)
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

def get_transaction(transactionId):
    response = json_rpc_request("user", "getTransaction", { "transactionId": transactionId }, apiKey=API_KEY)
    print("Get transaction response:", response.text)
    return response

def sign(transactionId, partyId):
    return json_rpc_request("user", "sign", { "transactionId": transactionId, "partyId": partyId }, apiKey=API_KEY)

def execute(transactionId, partyId, signature, signedBy):
    return json_rpc_request("user", "execute", { "transactionId": transactionId, "partyId": partyId, "signature": signature, "signedBy": signedBy }, apiKey=API_KEY)


def main():
    if not API_KEY:
        print("Please create an API_KEY in the Wallet Gateway before running")
        return

    list_accounts()
    primaryParty = get_primary_account()

    print("\nReceived primary party: ", primaryParty)

    pingCommand = ping_create_command("alex2::1220c698552fa35fe46181e2c5c642ea6e11222534fea32001c7a123dd4bd272d8d5")

    prepared = prepare_execute(pingCommand)
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

    signed = sign(transactionId, primaryParty)
    print("Sign response:", signed.text)

    status = signed.json().get("result", {}).get("status")
    # if status != "success":
    #     print("Sign failed:", signed.text)
    #     return

    signature = signed.json().get("result", {}).get("signature")
    signedBy = signed.json().get("result", {}).get("signedBy")

    executeR = execute(transactionId, primaryParty, signature, signedBy)
    print("Execute response:", executeR.text)

if __name__ == "__main__":
    main()
