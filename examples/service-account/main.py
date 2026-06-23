import requests

API_KEY = "f7ab73d63b93b24501b891c6289c7cb3457d18cec9bdbe777d5f8ce00d7174f3"

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

def main():
    if not API_KEY:
        print("Please create an API_KEY in the Wallet Gateway before running")
        return

    list_accounts()
    primaryParty = get_primary_account()

    print("\nReceived primary party: ", primaryParty)

if __name__ == "__main__":
    main()
