from pydantic import BaseModel, HttpUrl, Field
from typing import Dict

class ProcessRequest(BaseModel):
    url: HttpUrl = Field(..., example="https://www.youtube.com/watch?v=dQw4w9WgXcQ")

class ProcessResponse(BaseModel):
    transcript: str = Field(..., example="Never gonna give you up...")
    summary: str = Field(..., example="A man sings about loyalty and never giving up.")
    social_posts: Dict[str, str] = Field(
        ..., 
        example={
            "twitter": "Ever felt loyal to the core? Here's why 💯 #NeverGonnaGiveYouUp",
            "instagram": "Throwback vibes with this all-time classic 🎶 #Loyalty #80s",
            "youtube": "One of the most iconic anthems of the '80s. Enjoy!"
        }
    )