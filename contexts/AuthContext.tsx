"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from "firebase/auth";
import { signInWithGoogle, signInWithGithub } from "@/services/auth/firebase";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Organization } from "@/types/organization";

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: { displayName?: string; photoURL?: string }) => Promise<void>;
  signInWithGoogleProvider: () => Promise<void>;
  signInWithGithubProvider: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrganization = async (userId: string) => {
    try {
      const response = await fetch('/api/organizations', {
        headers: {
          'x-user-id': userId
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrganization(data.organization || null);
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error);
      setOrganization(null);
    }
  };

  const refreshOrganization = async () => {
    if (!user) return;
    await fetchOrganization(user.uid);
  };

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state listener");
    setLoading(true);

    // Attempt to get the current user immediately
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log("Current user found immediately");
      setUser(currentUser);
      fetchOrganization(currentUser.uid);
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        console.log("User signed in:", firebaseUser.uid);
        setUser(firebaseUser);

        // Fetch user's organization
        await fetchOrganization(firebaseUser.uid);

        // Create/update user profile in Firestore
        try {
          await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            }),
          });
        } catch (error) {
          console.error("Error updating user profile:", error);
        }
      } else {
        console.log("User signed out");
        setUser(null);
        setOrganization(null);
      }
      
      setLoading(false);
    });

    return () => {
      console.log("AuthProvider: Cleaning up auth state listener");
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Fetch organization first
      await fetchOrganization(result.user.uid);
      // Routing is now handled by home page based on org status
      router.push("/");
    } catch (error: any) {
      console.error("Error signing in:", error);
      
      // Provide specific error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error("This account doesn't exist. Please create an account first.");
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        throw new Error("Invalid email or password. Please check your credentials or create an account if you don't have one.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Please enter a valid email address.");
      } else if (error.code === 'auth/user-disabled') {
        throw new Error("This account has been disabled. Please contact support.");
      } else {
        throw new Error(error.message || "Failed to sign in. Please try again.");
      }
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateFirebaseProfile(auth.currentUser as User, { displayName });
      }
      
      // New users don't have org, send to onboarding
      router.push("/onboarding");
    } catch (error: any) {
      console.error("Error signing up:", error);
      
      // Provide specific error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("An account with this email already exists. Please sign in instead.");
      } else if (error.code === 'auth/weak-password') {
        throw new Error("Password is too weak. Please choose a stronger password.");
      } else if (error.code === 'auth/invalid-email') {
        throw new Error("Please enter a valid email address.");
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error("Email/password accounts are not enabled. Please contact support.");
      } else {
        throw new Error(error.message || "Failed to create account. Please try again.");
      }
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Clear user and org state BEFORE Firebase signOut
      setUser(null);
      setOrganization(null);
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear any cached data
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      // Small delay to ensure state is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Force redirect to login
      window.location.href = '/auth/login';
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setOrganization(null);
      window.location.href = '/auth/login';
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: { displayName?: string; photoURL?: string }) => {
    if (!user) throw new Error("No user logged in");
    
    // Get the current Firebase auth user to ensure we have all methods
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No authenticated user found");
    
    await updateFirebaseProfile(currentUser, profileData);
    
    // Update user state
    setUser({
      ...user,
      ...profileData,
    });
  };

  const signInWithGoogleProvider = async () => {
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signInWithGithubProvider = async () => {
    try {
      await signInWithGithub();
      router.push("/");
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
      throw error;
    }
  };

  const value = {
    user,
    organization,
    loading,
    login,
    register,
    logout,
    updateProfile,
    signInWithGoogleProvider,
    signInWithGithubProvider,
    refreshOrganization
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
