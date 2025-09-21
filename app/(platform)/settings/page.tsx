// File: app/(platform)/settings/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save, UserCircle } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import type { PutBlobResult } from '@vercel/blob';

type ProfileData = {
    name: string;
    storyNotes: string;
    profileImage: string;
};

export default function SettingsPage() {
    const inputFileRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<ProfileData>({ name: '', storyNotes: '', profileImage: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const response = await fetch('/api/profile');
                if (response.ok) {
                    const data = await response.json();
                    setProfile({ 
                        name: data.name || '', 
                        storyNotes: data.storyNotes || '',
                        profileImage: data.profileImage || ''
                    });
                }
            } catch (error) {
                toast.error("Failed to load profile information.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await fetch(`/api/upload?filename=${file.name}`, {
                method: 'POST',
                body: file,
            });
            const newBlob = (await response.json()) as PutBlobResult;
            setProfile(p => ({ ...p, profileImage: newBlob.url }));
            toast.success("Profile image uploaded!");
        } catch (error) {
            toast.error("Image upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            if (!response.ok) throw new Error("Failed to save profile.");
            toast.success("Profile saved and AI biography updated!");
        } catch (error) {
            toast.error("Could not save your profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your public artisan profile here.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Your Public Brand</CardTitle>
                        <CardDescription>
                            This information will be used by our AI to create your beautiful, public-facing artisan page.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex items-center gap-6">
                             <Input id="profileImage" type="file" ref={inputFileRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
                             <button type="button" onClick={() => inputFileRef.current?.click()} disabled={isUploading} className="relative h-24 w-24 rounded-full group bg-muted flex items-center justify-center">
                                {profile.profileImage ? (
                                    <Image src={profile.profileImage} alt="Profile" fill className="rounded-full object-cover" />
                                ) : (
                                    <UserCircle className="h-12 w-12 text-muted-foreground" />
                                )}
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-white"/> : <span className="text-white text-xs font-semibold">Change</span>}
                                </div>
                             </button>
                             <div className="flex-grow">
                                <Label htmlFor="name">Your Name or Brand Name</Label>
                                <Input 
                                    id="name" 
                                    value={profile.name}
                                    onChange={(e) => setProfile(p => ({...p, name: e.target.value}))}
                                    placeholder="e.g., Priya Sharma Pottery"
                                />
                             </div>
                        </div>
                        <div>
                            <Label htmlFor="story">Your Story</Label>
                            <Textarea 
                                id="story"
                                value={profile.storyNotes}
                                onChange={(e) => setProfile(p => ({...p, storyNotes: e.target.value}))}
                                placeholder="Tell us about yourself, your craft, your history, and what inspires you..."
                                rows={8}
                            />
                        </div>
                        <Button type="submit" disabled={isSaving || isUploading}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Profile
                        </Button>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}