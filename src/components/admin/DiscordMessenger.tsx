import { useState } from "react";
import { Send, Hash, Star, Image, Palette, Plus, X, Megaphone, RefreshCw, PartyPopper, AlertTriangle, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MESSAGE_TYPES = [
  { id: "announcement", label: "Announcement", icon: Megaphone, color: "#d4a44a" },
  { id: "update", label: "Update", icon: RefreshCw, color: "#3b82f6" },
  { id: "event", label: "Event", icon: PartyPopper, color: "#a855f7" },
  { id: "alert", label: "Alert", icon: AlertTriangle, color: "#ef4444" },
  { id: "review", label: "Featured Review", icon: Star, color: "#f59e0b" },
  { id: "custom", label: "Custom", icon: MessageSquare, color: "#10b981" },
];

interface CustomField {
  name: string;
  value: string;
  inline: boolean;
}

export const DiscordMessenger = () => {
  const [type, setType] = useState("announcement");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [color, setColor] = useState("#d4a44a");
  const [imageUrl, setImageUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [threadName, setThreadName] = useState("");
  const [pingEveryone, setPingEveryone] = useState(false);
  const [fields, setFields] = useState<CustomField[]>([]);
  const [sending, setSending] = useState(false);

  const selectedType = MESSAGE_TYPES.find(t => t.id === type);

  const handleTypeChange = (newType: string) => {
    setType(newType);
    const t = MESSAGE_TYPES.find(m => m.id === newType);
    if (t) setColor(t.color);
    if (newType === "review") setShowRating(true);
  };

  const addField = () => {
    setFields([...fields, { name: "", value: "", inline: true }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof CustomField, value: string | boolean) => {
    const updated = [...fields];
    (updated[index] as any)[key] = value;
    setFields(updated);
  };

  const handleSend = async () => {
    if (!title.trim() && !message.trim()) {
      toast.error("Please enter a title or message");
      return;
    }

    setSending(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("discord-send-message", {
        body: {
          type,
          title: title.trim(),
          message: message.trim(),
          color,
          imageUrl: imageUrl.trim() || undefined,
          thumbnailUrl: thumbnailUrl.trim() || undefined,
          rating: showRating ? rating : undefined,
          fields: fields.filter(f => f.name && f.value),
          threadName: threadName.trim() || undefined,
          pingEveryone,
        },
      });

      if (error) throw error;

      toast.success("Message sent to Discord!");
      setTitle("");
      setMessage("");
      setImageUrl("");
      setThumbnailUrl("");
      setRating(null);
      setFields([]);
      setThreadName("");
      setPingEveryone(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Build preview embed
  const ratingBar = rating !== null
    ? "█".repeat(Math.round(rating)) + "░".repeat(10 - Math.round(rating))
    : null;

  return (
    <div className="space-y-6">
      {/* Message Type Selector */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Message Type</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {MESSAGE_TYPES.map((mt) => {
            const Icon = mt.icon;
            return (
              <button
                key={mt.id}
                onClick={() => handleTypeChange(mt.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                  type === mt.id
                    ? "border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                    : "border-border/40 bg-card/50 hover:border-primary/30"
                )}
              >
                <Icon className="h-5 w-5" style={{ color: mt.color }} />
                <span className="text-xs font-medium">{mt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="dc-title">Title</Label>
            <Input
              id="dc-title"
              placeholder="Enter message title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="dc-message">Message</Label>
            <Textarea
              id="dc-message"
              placeholder="Enter your message content... (supports Discord markdown)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Color */}
          <div className="flex items-center gap-4">
            <div>
              <Label htmlFor="dc-color">Embed Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  id="dc-color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-28 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/30">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              <Label>Include Rating</Label>
            </div>
            <Switch checked={showRating} onCheckedChange={setShowRating} />
          </div>

          {showRating && (
            <div className="p-4 rounded-xl bg-card/50 border border-border/30 space-y-3">
              <div className="flex justify-between items-center">
                <Label>Rating: {rating?.toFixed(1) ?? "0.0"}/10</Label>
              </div>
              <Slider
                value={[rating ?? 0]}
                onValueChange={([v]) => setRating(v)}
                min={0}
                max={10}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs font-mono text-muted-foreground">
                {ratingBar}
              </p>
            </div>
          )}

          {/* Images */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dc-image" className="flex items-center gap-1">
                <Image className="h-3.5 w-3.5" /> Banner Image URL
              </Label>
              <Input
                id="dc-image"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="dc-thumb" className="flex items-center gap-1">
                <Image className="h-3.5 w-3.5" /> Thumbnail URL
              </Label>
              <Input
                id="dc-thumb"
                placeholder="https://..."
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Custom Fields */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Custom Fields</Label>
              <Button variant="ghost" size="sm" onClick={addField} className="gap-1 text-xs">
                <Plus className="h-3.5 w-3.5" /> Add Field
              </Button>
            </div>
            {fields.map((field, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <Input
                  placeholder="Name"
                  value={field.name}
                  onChange={(e) => updateField(i, "name", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => updateField(i, "value", e.target.value)}
                  className="flex-1"
                />
                <div className="flex items-center gap-1">
                  <Label className="text-xs">Inline</Label>
                  <Switch
                    checked={field.inline}
                    onCheckedChange={(v) => updateField(i, "inline", v)}
                  />
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeField(i)} className="h-8 w-8 text-destructive">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/30">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-destructive" />
                <Label>Ping @everyone</Label>
              </div>
              <Switch checked={pingEveryone} onCheckedChange={setPingEveryone} />
            </div>
          </div>

          {/* Send */}
          <Button
            onClick={handleSend}
            disabled={sending || (!title.trim() && !message.trim())}
            className="w-full h-12 gap-2 rounded-xl text-lg font-bold shadow-glow"
            size="lg"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            {sending ? "Sending..." : "Send to Discord"}
          </Button>
        </div>

        {/* Live Preview */}
        <div>
          <Label className="mb-3 block">Live Preview</Label>
          <div className="rounded-xl bg-[#313338] p-4 space-y-3 border border-[#3f4147]">
            {/* Discord message header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">Bloxwave</span>
                  <Badge className="bg-[#5865F2] text-white text-[10px] px-1 py-0 h-4">BOT</Badge>
                  <span className="text-xs text-[#949ba4]">Today</span>
                </div>
                {/* Content text */}
                {(title || selectedType) && (
                  <p className="text-[#dcddde] text-sm mt-1">
                    {pingEveryone && <span className="text-[#dee0fc] bg-[#414675] rounded px-1">@everyone</span>}
                    {title && <span className="font-bold block text-lg text-white mt-1">{title}</span>}
                  </p>
                )}

                {/* Embed */}
                <div
                  className="mt-2 rounded-md overflow-hidden border-l-4 bg-[#2b2d31] max-w-md"
                  style={{ borderLeftColor: color }}
                >
                  <div className="p-3 space-y-2">
                    {title && <p className="text-[#00a8fc] font-semibold text-sm">{title}</p>}
                    {message && <p className="text-[#dcddde] text-sm whitespace-pre-wrap">{message.slice(0, 200)}</p>}

                    {showRating && rating !== null && (
                      <div className="mt-2">
                        <p className="text-[#949ba4] text-xs font-bold uppercase">Rating</p>
                        <p className="text-[#dcddde] text-sm font-mono">
                          {ratingBar} <span className="font-bold">{rating.toFixed(1)}</span>/10
                        </p>
                      </div>
                    )}

                    {fields.filter(f => f.name && f.value).length > 0 && (
                      <div className={cn("grid gap-2 mt-2", fields.some(f => f.inline) ? "grid-cols-3" : "grid-cols-1")}>
                        {fields.filter(f => f.name && f.value).map((f, i) => (
                          <div key={i} className={f.inline ? "" : "col-span-3"}>
                            <p className="text-[#949ba4] text-xs font-bold uppercase">{f.name}</p>
                            <p className="text-[#dcddde] text-sm">{f.value}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {imageUrl && (
                      <div className="mt-2 rounded overflow-hidden">
                        <img src={imageUrl} alt="Preview" className="max-h-40 w-full object-cover rounded" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#3f4147]">
                      <span className="text-[#949ba4] text-[10px]">BLOXWAVE · Admin</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
