from web3 import Web3
from web3.middleware import geth_poa_middleware


class ZeroSwipe:
    def __init__(self, contract_address, rpc_url, abi):
        self.web3 = Web3(Web3.HTTPProvider(rpc_url))
        self.web3.middleware_onion.inject(geth_poa_middleware, layer=0)
        self.contract_address = Web3.to_checksum_address(contract_address)
        self.contract = self.web3.eth.contract(address=self.contract_address, abi=abi)

    def get_profile(self, address):
        return self.contract.functions.profiles(address).call()

    def get_active_profiles(self):
        return self.contract.functions.getActiveProfiles().call()

    def get_recommendations(self, profile_address):
        return self.contract.functions.getRecommendations(profile_address).call()
