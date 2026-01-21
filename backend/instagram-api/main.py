"""
Instagram API Backend using Instaloader
Provides profile stats and recent posts with engagement metrics
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import instaloader
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Instagram API",
    description="Fetch Instagram profile stats and posts using Instaloader",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Instaloader instance
# Using a persistent instance to leverage session caching
loader = instaloader.Instaloader(
    download_pictures=False,
    download_videos=False,
    download_video_thumbnails=False,
    download_geotags=False,
    download_comments=False,
    save_metadata=False,
    compress_json=False,
    quiet=True
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "instagram-api"}


@app.get("/profile/{username}")
async def get_profile(username: str):
    """
    Get Instagram profile information
    
    Returns:
        Profile stats including followers, following, posts count, bio, etc.
    """
    try:
        logger.info(f"Fetching profile for: {username}")
        
        profile = instaloader.Profile.from_username(loader.context, username)
        
        return {
            "status": "success",
            "data": {
                "username": profile.username,
                "full_name": profile.full_name,
                "bio": profile.biography,
                "biography_hashtags": profile.biography_hashtags,
                "biography_mentions": profile.biography_mentions,
                "external_url": profile.external_url,
                "followers": profile.followers,
                "following": profile.followees,
                "posts_count": profile.mediacount,
                "profile_pic_url": profile.profile_pic_url,
                "is_private": profile.is_private,
                "is_verified": profile.is_verified,
                "is_business": profile.is_business_account,
                "business_category": profile.business_category_name if profile.is_business_account else None,
            }
        }
        
    except instaloader.exceptions.ProfileNotExistsException:
        raise HTTPException(status_code=404, detail=f"Profile '{username}' not found")
    except instaloader.exceptions.ConnectionException as e:
        logger.error(f"Connection error: {e}")
        raise HTTPException(status_code=503, detail="Failed to connect to Instagram. Please try again.")
    except instaloader.exceptions.LoginRequiredException:
        raise HTTPException(status_code=401, detail="This profile requires login to access")
    except Exception as e:
        logger.error(f"Error fetching profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/posts/{username}")
async def get_posts(username: str, limit: int = 12):
    """
    Get recent posts from an Instagram profile
    
    Args:
        username: Instagram username
        limit: Maximum number of posts to fetch (default: 12, max: 50)
    
    Returns:
        Array of posts with engagement metrics
    """
    try:
        # Cap limit to prevent excessive requests
        limit = min(limit, 50)
        
        logger.info(f"Fetching posts for: {username} (limit: {limit})")
        
        profile = instaloader.Profile.from_username(loader.context, username)
        
        if profile.is_private:
            return {
                "status": "success",
                "data": [],
                "message": "This is a private account. Posts are not accessible."
            }
        
        posts = []
        for i, post in enumerate(profile.get_posts()):
            if i >= limit:
                break
            
            posts.append({
                "id": post.mediaid,
                "shortcode": post.shortcode,
                "url": f"https://www.instagram.com/p/{post.shortcode}/",
                "caption": post.caption[:500] if post.caption else None,  # Truncate long captions
                "caption_hashtags": post.caption_hashtags,
                "likes": post.likes,
                "comments": post.comments,
                "timestamp": post.date_utc.isoformat(),
                "media_url": post.url,
                "is_video": post.is_video,
                "video_view_count": post.video_view_count if post.is_video else None,
                "typename": post.typename,  # GraphImage, GraphVideo, GraphSidecar
            })
        
        return {
            "status": "success",
            "data": posts,
            "count": len(posts),
            "profile": {
                "username": profile.username,
                "full_name": profile.full_name,
                "profile_pic_url": profile.profile_pic_url,
            }
        }
        
    except instaloader.exceptions.ProfileNotExistsException:
        raise HTTPException(status_code=404, detail=f"Profile '{username}' not found")
    except instaloader.exceptions.ConnectionException as e:
        logger.error(f"Connection error: {e}")
        raise HTTPException(status_code=503, detail="Failed to connect to Instagram. Please try again.")
    except instaloader.exceptions.LoginRequiredException:
        raise HTTPException(status_code=401, detail="This profile requires login to access")
    except Exception as e:
        logger.error(f"Error fetching posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Instagram API server on http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
