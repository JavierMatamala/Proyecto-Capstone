from fastapi import APIRouter, UploadFile, File, HTTPException
import cloudinary.uploader

router = APIRouter(prefix="/upload", tags=["Uploads"])

@router.post("/imagen")
async def subir_imagen(file: UploadFile = File(...)):
    try:
        # Cloudinary recibe el archivo directamente
        result = cloudinary.uploader.upload(
            file.file,
            folder="musicpricehub/productos"   # carpeta opcional
        )

        return {
            "url": result["secure_url"],
            "public_id": result["public_id"]
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
