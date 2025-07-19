"use client";
import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trophy, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Comment {
  comment_id: string;
  created_at: string;
  profile_pic_url: string;
  text: string;
  user_id: string;
  username: string;
}

export default function InstagramLottery() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLotteryRunning, setIsLotteryRunning] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [winner, setWinner] = useState<Comment | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentSelection, setCurrentSelection] = useState<Comment | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (csvText: string): Comment[] => {
    const lines = csvText.split("\n");
    const headers = lines[0].split(";").map((h) => h.trim().replace(/"/g, ""));

    return lines
      .slice(1)
      .filter((line) => line.trim())
      .map((line) => {
        const values = line.split(";").map((v) => v.trim().replace(/"/g, ""));
        const comment: any = {};
        headers.forEach((header, index) => {
          comment[header] = values[index] || "";
        });

        return comment as Comment;
      });
    //.filter((comment) => comment.username && comment.comment_id);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const parsedComments = parseCSV(csvText);
      setComments(parsedComments);
      setWinner(null);
      setShowConfetti(false);
    };
    reader.readAsText(file);
  };

  const startLottery = () => {
    if (comments.length === 0) return;

    setIsLotteryRunning(true);
    setWinner(null);
    setShowConfetti(false);
    setCountdown(5);
  };

  useEffect(() => {
    if (!isLotteryRunning) return;

    if (countdown > 0) {
      // Show random selections during countdown
      const interval = setInterval(() => {
        const randomComment =
          comments[Math.floor(Math.random() * comments.length)];
        setCurrentSelection(randomComment);
      }, 100);

      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    } else {
      // Select final winner
      const finalWinner = comments[Math.floor(Math.random() * comments.length)];
      setWinner(finalWinner);
      setCurrentSelection(null);
      setIsLotteryRunning(false);
      setShowConfetti(true);

      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [countdown, isLotteryRunning, comments]);

  const resetLottery = () => {
    setWinner(null);
    setShowConfetti(false);
    setIsLotteryRunning(false);
    setCurrentSelection(null);
    setCountdown(10);
  };

  const showAvatarFallBack = (comment: Comment) => {
    console.log(comment);
    return comment.username?.[0]?.toUpperCase();
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-4">
      {/* Confetti Animation */}

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(150)].map((_, i) => {
            const size = Math.random() * 8 + 4;
            const left = Math.random() * 100;
            const delay = Math.random() * 2;
            const duration = Math.random() * 3 + 3;
            const shape = Math.random() > 0.5 ? "50%" : "0%";
            const colors = [
              "bg-yellow-400",
              "bg-pink-400",
              "bg-blue-400",
              "bg-green-400",
              "bg-purple-400",
              "bg-red-400",
              "bg-orange-300",
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];

            return (
              <div
                key={i}
                className={`${color}`}
                style={{
                  position: "absolute",
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: `-${size}px`,
                  borderRadius: shape,
                  opacity: Math.random() * 0.5 + 0.5,
                  animation: `confetti-fall ${duration}s linear ${delay}s forwards`,
                }}
              />
            );
          })}
          {/* Add the keyframe animation here */}
          <style jsx>{`
            @keyframes confetti-fall {
              0% {
                transform: translateY(0) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
              }
            }
          `}</style>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎉 Instagram Comment Lottery 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-upload">Upload CSV File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose CSV File
                </Button>
              </div>
            </div>

            {comments.length > 0 && (
              <div className="text-sm text-muted-foreground">
                📊 Loaded {comments.length} comments
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lottery Display */}
        {comments.length > 0 && (
          <Card className="text-center">
            <CardContent className="p-8">
              {!isLotteryRunning && !winner && (
                <Button
                  onClick={startLottery}
                  size="lg"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full text-xl"
                >
                  <Sparkles className="w-6 h-6 mr-2" />
                  Start Lottery!
                </Button>
              )}

              {isLotteryRunning && (
                <div className="space-y-6">
                  <div className="text-8xl font-bold text-purple-600 animate-pulse">
                    {countdown}
                  </div>

                  {currentSelection && (
                    <div className="transform transition-all duration-300 animate-bounce">
                      <Card className="p-4 bg-gradient-to-r from-purple-100 to-pink-100">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage
                              src={
                                currentSelection.profile_pic_url ||
                                "/placeholder.svg"
                              }
                            />
                            <AvatarFallback>
                              {showAvatarFallBack(currentSelection)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-left">
                            <div className="font-bold">
                              @{currentSelection.username}
                            </div>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {currentSelection.text}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              )}

              {winner && (
                <div className="space-y-6 animate-in fade-in-50 duration-1000">
                  <div className="text-4xl font-bold text-yellow-500 flex items-center justify-center gap-2">
                    <Trophy className="w-10 h-10" />
                    WINNER!
                    <Trophy className="w-10 h-10" />
                  </div>

                  <Card className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-4 border-yellow-400 transform scale-105">
                    <div className="flex items-center gap-6">
                      <Avatar className="w-20 h-20 border-4 border-yellow-400">
                        <AvatarImage
                          src={winner.profile_pic_url || "/placeholder.svg"}
                        />
                        <AvatarFallback className="text-2xl">
                          {showAvatarFallBack(winner)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left flex-1">
                        <div className="text-3xl font-bold text-purple-700">
                          @{winner.username}
                        </div>
                        <div className="text-lg text-gray-700 mt-2">
                          "{winner.text}"
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          Comment ID: {winner.comment_id}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Button
                    onClick={resetLottery}
                    variant="outline"
                    className="mt-4 bg-transparent"
                  >
                    Run Another Lottery
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
