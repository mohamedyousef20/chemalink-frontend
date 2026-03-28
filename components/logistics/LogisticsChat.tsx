"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, User } from "lucide-react";
import { logisticsService } from "@/lib/logisticsService";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket";

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
  };
  content: string;
  timestamp: string;
}

export default function LogisticsChat({ deliveryId, currentUser }: { deliveryId: string, currentUser: any }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChat();
    
    const socket = getSocket();
    socket.on('new_logistics_message', (data: { deliveryId: string, message: Message }) => {
      if (data.deliveryId === deliveryId) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    return () => {
      socket.off('new_logistics_message');
    };
  }, [deliveryId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchChat = async () => {
    try {
      setLoading(true);
      const res = await logisticsService.chat.getByDelivery(deliveryId);
      setMessages(res.data.data.messages);
    } catch (error) {
      toast.error("Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const res = await logisticsService.chat.sendMessage(deliveryId, newMessage);
      setMessages([...messages, { ...res.data.data, sender: currentUser }]);
      setNewMessage("");
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin h-6 w-6" /></div>;

  return (
    <div className="flex flex-col h-[400px] border rounded-lg overflow-hidden bg-background">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => {
            const isMe = msg.sender?._id === currentUser?._id;
            return (
              <div key={msg._id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar className="h-8 w-8 border">
                    <AvatarImage src={msg.sender?.avatar} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                      {msg.content}
                    </div>
                    <p className="text-[10px] text-muted-foreground px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-3 border-t bg-muted/30 flex gap-2">
        <Input 
          placeholder="Type your message..." 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          className="flex-1"
        />
        <Button size="icon" type="submit" disabled={sending || !newMessage.trim()}>
          {sending ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
