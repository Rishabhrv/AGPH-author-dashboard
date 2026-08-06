"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  cookies().delete("auth_token");
  redirect("/login");
}

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const apiUrl = process.env.API_URL || "http://localhost:5001";

  try {
    const res = await fetch(`${apiUrl}/api/author/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: email, password }),
    });

    if (!res.ok) {
      // Try to parse the error message from the backend, if any
      let errorMessage = "Invalid email or password";
      let lockoutSeconds = 0;
      try {
        const data = await res.json();
        if (data.error) errorMessage = data.error;
        else if (data.message) errorMessage = data.message;
        if (data.lockout_seconds) lockoutSeconds = data.lockout_seconds;
      } catch (e) {
        // Fallback if not JSON
      }
      return { error: errorMessage, lockoutSeconds };
    }

    const data = await res.json();

    // We assume the backend returns a token in { token: string }
    if (data.token) {
      cookies().set("auth_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 day
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
        transactions: data.transactions || [],
        royaltySettings: data.royaltySettings || null
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

export async function submitAuthorOnboarding(formData: FormData) {
  const token = cookies().get("auth_token")?.value;
  if (!token) return { success: false, message: "Unauthorized" };

  const apiUrl = process.env.API_URL || "http://localhost:5001";
  try {
    const res = await fetch(`${apiUrl}/api/author/onboarding`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    });

    if (!res.ok) {
      return { success: false, message: "Failed to submit onboarding" };
    }

    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Onboarding upload error:", e);
    return { success: false, message: "Network error" };
  }
}

export async function getAuthorBadges() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return null;

  const apiUrl = process.env.API_URL || "http://localhost:5001";
  try {
    const res = await fetch(`${apiUrl}/api/author/badges`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store"
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (e) {
    console.error("Badges fetch error:", e);
    return null;
  }
}

export async function syncAuthorBadges(badgeData: any) {
  const token = cookies().get("auth_token")?.value;
  if (!token) return { success: false };

  const apiUrl = process.env.API_URL || "http://localhost:5001";
  try {
    const res = await fetch(`${apiUrl}/api/author/badges/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(badgeData)
    });

    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Badges sync error:", e);
    return { success: false };
  }
}

export async function getAuthorLeaderboard() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return null;

  const apiUrl = process.env.API_URL || "http://localhost:5001";
  try {
    const res = await fetch(`${apiUrl}/api/author/leaderboard`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      cache: "no-store"
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (e) {
    console.error("Leaderboard fetch error:", e);
    return null;
  }
}
