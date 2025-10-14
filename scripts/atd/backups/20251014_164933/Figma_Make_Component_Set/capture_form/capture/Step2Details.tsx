import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import gsap from "gsap";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import type { CaptureFormData, Priority } from "../../hooks/useCaptureForm";

interface Step2DetailsProps {
  formData: CaptureFormData;
  errors: Record<string, string>;
  onUpdateField: (field: string, value: any) => void;
}

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: "low", label: "Low", color: "bg-gray-500" },
  { value: "medium", label: "Medium", color: "bg-blue-500" },
  { value: "high", label: "High", color: "bg-yellow-500" },
  { value: "urgent", label: "Urgent", color: "bg-red-500" },
];

const suggestedTags = [
  "follow-up",
  "urgent",
  "customer-request",
  "feedback",
  "issue",
  "opportunity",
];

export function Step2Details({
  formData,
  errors,
  onUpdateField,
}: Step2DetailsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tagInput, setTagInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" },
      );
    }
  }, []);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [formData.content]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (
      trimmedTag &&
      !formData.tags.includes(trimmedTag) &&
      formData.tags.length < 10
    ) {
      onUpdateField("tags", [...formData.tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateField(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title" className="mb-2 block">
          What happened? <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          type="text"
          placeholder="Enter a brief title..."
          value={formData.title}
          onChange={(e) => onUpdateField("title", e.target.value)}
          className={
            errors.title ? "border-red-500 focus-visible:ring-red-500" : ""
          }
          maxLength={200}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.title && (
              <p id="title-error" className="text-xs text-red-500" role="alert">
                {errors.title}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500">{formData.title.length}/200</p>
        </div>
      </div>

      {/* Content */}
      <div>
        <Label htmlFor="content" className="mb-2 block">
          Details
        </Label>
        <Textarea
          ref={textareaRef}
          id="content"
          placeholder="Add context, next steps, or any important information..."
          value={formData.content}
          onChange={(e) => onUpdateField("content", e.target.value)}
          className={`min-h-32 resize-none ${errors.content ? "border-red-500 focus-visible:ring-red-500" : ""}`}
          maxLength={5000}
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? "content-error" : undefined}
        />
        <div className="flex justify-between mt-1">
          <div>
            {errors.content && (
              <p
                id="content-error"
                className="text-xs text-red-500"
                role="alert"
              >
                {errors.content}
              </p>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {formData.content.length}/5000
          </p>
        </div>
      </div>

      {/* Priority */}
      <div>
        <Label className="mb-3 block">Priority</Label>
        <div className="flex gap-2 flex-wrap">
          {priorities.map((priority) => (
            <button
              key={priority.value}
              type="button"
              onClick={() => onUpdateField("priority", priority.value)}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                formData.priority === priority.value
                  ? "border-purple-600 bg-purple-50 text-purple-900"
                  : "border-gray-200 bg-white text-gray-700 hover:border-purple-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${priority.color}`}></div>
                <span>{priority.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label htmlFor="tags" className="mb-2 block">
          Tags (optional)
        </Label>

        {/* Tag input */}
        <Input
          id="tags"
          type="text"
          placeholder="Type and press Enter..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={formData.tags.length >= 10}
        />

        {errors.tags && (
          <p className="text-xs text-red-500 mt-1" role="alert">
            {errors.tags}
          </p>
        )}

        {/* Current tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="pl-3 pr-2 py-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 hover:text-red-600 transition-colors"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Suggested tags */}
        {formData.tags.length < 10 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2">Suggested:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedTags
                .filter((tag) => !formData.tags.includes(tag))
                .slice(0, 5)
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-purple-100 hover:text-purple-700 transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
