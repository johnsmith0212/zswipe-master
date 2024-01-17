import nft_storage
from nft_storage.api import nft_storage_api
from io import BytesIO
from nft_storage.configuration import Configuration


def upload_to_filecoin(file_content, api_key):
    configuration = Configuration(access_token=api_key)

    with nft_storage.ApiClient(configuration) as api_client:
        api_instance = nft_storage_api.NFTStorageAPI(api_client)
        file_stream = BytesIO(file_content)  # Create a BytesIO object from the binary content

        try:
            # Store the file
            api_response = api_instance.store(file_stream, _check_return_type=False)
            file_url = f"https://ipfs.io/ipfs/{api_response.value['cid']}"
            return file_url
        except nft_storage.ApiException as e:
            print(f"Exception when calling NFTStorageAPI->store: {e}\n")
            return None


if __name__ == '__main__':
    import os
    from dotenv import load_dotenv
    load_dotenv()
    file_content = open('test3.png', 'rb').read()
    file_url = upload_to_filecoin(file_content, os.environ['NFT_STORAGE_API_KEY'])
    print(file_url)
