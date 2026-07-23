"use server";

import { cookies } from "next/headers";

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const apiUrl = process.env.API_URL || "http://localhost:5001";

  try {
    const res = await fetch(`${apiUrl}/api/author/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      // Try to parse the error message from the backend, if any
      let errorMessage = "Invalid username or password";
      try {
        const data = await res.json();
        if (data.error) errorMessage = data.error;
        else if (data.message) errorMessage = data.message;
      } catch (e) {
        // Fallback if not JSON
      }
      return { error: errorMessage };
    }

    const data = await res.json();

    // We assume the backend returns a token in { token: string }
    if (data.token) {
      cookies().set("auth_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });
      return { success: true };
    }

    return { error: "Unexpected response format from server" };

  } catch (err) {
    console.error("Login fetch error:", err);
    return { error: "Failed to connect to the authentication server." };
  }
}

export async function getAuthorDetails() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return null;

  const apiUrl = process.env.API_URL || "http://localhost:5001";
  try {
    const res = await fetch(`${apiUrl}/api/author/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    
    if (!res.ok) return null;

    const data = await res.json();
    if (data.valid && data.username) {
      return data.username;
    }
    return null;
  } catch (e) {
    console.error("Token validation error:", e);
    return null;
  }
}

export async function logoutAction() {
  cookies().delete("auth_token");
}

export async function getAuthorProfileData() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return null;

  const apiUrl = process.env.API_URL || "http://localhost:5001";
  try {
    const res = await fetch(`${apiUrl}/api/author/profile`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store"
    });
    
    if (!res.ok) return null;

    const data = await res.json();
    if (data.success && data.profile) {
      if (data.profile.profileImageUrl && data.profile.profileImageUrl.startsWith('/api/')) {
        data.profile.profileImageUrl = `${apiUrl}${data.profile.profileImageUrl}`;
      }
      return data.profile;
    }
    return null;
  } catch (e) {
    console.error("Profile fetch error:", e);
    return null;
  }
}

export async function updateAuthorProfileData(profileData: any) {
  const token = cookies().get("auth_token")?.value;
  if (!token) return { success: false, message: "Unauthorized" };

  const apiUrl = process.env.API_URL || "http://localhost:5001";
  try {
    const res = await fetch(`${apiUrl}/api/author/profile`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    
    if (!res.ok) {
      return { success: false, message: "Failed to update profile" };
    }

    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Profile update error:", e);
    return { success: false, message: "Network error" };
  }
}

export async function uploadAuthorProfilePhoto(formData: FormData) {
  const token = cookies().get("auth_token")?.value;
  if (!token) return { success: false, message: "Unauthorized" };

  const apiUrl = process.env.API_URL || "http://localhost:5001";
  try {
    const res = await fetch(`${apiUrl}/api/author/photo`, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });
    
    if (!res.ok) {
      return { success: false, message: "Failed to upload photo" };
    }

    const data = await res.json();
    if (data.success && data.file_url) {
      if (data.file_url.startsWith('/api/')) {
        data.file_url = `${apiUrl}${data.file_url}`;
      }
    }
    return data;
  } catch (e) {
    console.error("Photo upload error:", e);
    return { success: false, message: "Network error" };
  }
}

export async function getAuthorSalesData() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return null;

  const apiUrl = process.env.API_URL || "http://localhost:5001";
  try {
    const res = await fetch(`${apiUrl}/api/author/sales`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store"
    });
    
    if (!res.ok) return null;

    const data = await res.json();
    if (data.success) {
      return {
        books: data.books || [],
        transactions: data.transactions || []
      };
    }
    return null;
  } catch (e) {
    console.error("Sales data fetch error:", e);
    return null;
  }
}

export async function getAuthorReviewsData() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return null;

  const apiUrl = process.env.API_URL || "http://localhost:5001";
  try {
    const res = await fetch(`${apiUrl}/api/author/reviews`, {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store"
    });
    
    if (!res.ok) return null;

    const data = await res.json();
    if (data.success) {
      return {
        books: data.books || [],
        reviews: data.reviews || []
      };
    }
    return null;
    } catch (e) {
      console.error("Reviews fetch error:", e);
      return null;
    }
  }
  
  export async function getAuthorBooksProgressData() {
    const token = cookies().get("auth_token")?.value;
    if (!token) return null;
  
    const apiUrl = process.env.API_URL || "http://localhost:5001";
    try {
      const res = await fetch(`${apiUrl}/api/author/books-progress`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        cache: "no-store"
      });
      
      if (!res.ok) return null;
  
      const data = await res.json();
      if (data.success) {
        return data.books || [];
      }
      return null;
    } catch (e) {
      console.error("Books progress fetch error:", e);
      return null;
    }
  }
