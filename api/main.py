import os

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, status as http_status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import pyotp
import uvicorn
from pydantic import BaseModel
from web3 import Web3

from logger import get_logger
from storage import upload_to_filecoin
from utils import ErrorHandlerRoute
from wrapper import ZeroSwipe

load_dotenv()
logger = get_logger(__name__)

app = FastAPI(
    title='ZeroSwipes API', description='', version='0.1',
)
app.router.route_class = ErrorHandlerRoute


rpc_url = "https://scroll-sepolia.blockpi.network/v1/rpc/public"  # Replace with your Ethereum node RPC URL
contract_address = "0x490d9eA1AB42DF76a174D0216C127fc1834Fa89a"  # Replace with your contract address

# Initialize the DatingAppWrapper with contract details
dating_app = ZeroSwipe(contract_address, rpc_url)


# TODO: This needs to be tuned
origins = [
    "*"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def send_validation_error(detail):
    logger.error(f"Validation error: {detail}")
    raise HTTPException(status_code=422, detail=detail)


def validate_body(body) -> bool:
    return True


def get_totp():
    return pyotp.TOTP(os.getenv('TOTP_SECRET'))


@app.get('/')
async def status():
    return 'OK'


@app.post("/upload-file/")
async def upload_file(file: UploadFile = File(...)):
    file_content = await file.read()
    file_url = upload_to_filecoin(file_content, os.environ['NFT_STORAGE_API_KEY'])
    if file_url:
        return {"file_url": file_url}
    else:
        return {"error": "File upload failed"}
    
@app.get("/profile/{address}")
def get_profile(address: str):
    try:
        profile = dating_app.get_profile(Web3.to_checksum_address(address))
        return profile
    except Exception as e:  # You can refine the Exception handling
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/active-profiles/")
def get_active_profiles():
    try:
        active_profiles = dating_app.get_active_profiles()
        return active_profiles
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


class ProfileAddress(BaseModel):
    address: str

@app.post("/recommendations/")
def get_recommendations(profile_address: ProfileAddress):
    try:
        recommendations = dating_app.get_recommendations(Web3.to_checksum_address(profile_address.address))
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.on_event('startup')
async def startup():
    pass


if __name__ == '__main__':
    log_config = uvicorn.config.LOGGING_CONFIG
    log_config["formatters"]["access"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
    log_config["formatters"]["default"]["fmt"] = "%(asctime)s - %(levelname)s - %(message)s"
    uvicorn.run('main:app', host="0.0.0.0", port=80, reload=True)
