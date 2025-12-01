from fastapi import APIRouter, UploadFile, File, HTTPException
import cloudinary.uploader
import cloudinary_config

router = APIRouter(prefix="/upload", tags=["Uploads"])

@router.post("/imagen")
async def subir_imagen(file: UploadFile = File(...)):
    try:
        result = cloudinary.uploader.upload(
            file.file,
            folder="musicpricehub/productos",
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
        }
    except Exception as e:
        print("Error Cloudinary:", e)
        raise HTTPException(status_code=500, detail=str(e))

