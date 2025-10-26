import React from "react";
import { TouchableOpacity, View } from "react-native";
import {
  HandThumbDownIcon as HandThumbDownOutline,
  HandThumbUpIcon as HandThumbUpOutline,
} from "react-native-heroicons/outline";
import {
  HandThumbDownIcon as HandThumbDownSolid,
  HandThumbUpIcon as HandThumbUpSolid,
} from "react-native-heroicons/solid";

type Vote = -1 | 0 | 1;
type Variant = "solid" | "outlined";

type Props = {
  vote: Vote; // รับค่าจาก parent: -1 (dislike) | 0 (no vote) | 1 (like)
  onChange: (next: Vote) => void; // ส่งค่าใหม่กลับไปให้ parent
  variant?: Variant;
  className?: string; // สำหรับ nativewind
};

export default function ExplanationVote({
  vote,
  onChange,
  variant = "outlined",
  className = "",
}: Props) {
  const likeSelected = vote === 1;
  const dislikeSelected = vote === -1;

  // ✅ ถ้ามีการโหวตแล้ว (vote != 0) -> disable ทั้งคู่
  const disabledAll = vote !== 0;

  // pick icon set based on variant
  const UpIcon = variant === "solid" ? HandThumbUpSolid : HandThumbUpOutline;
  const DownIcon =
    variant === "solid" ? HandThumbDownSolid : HandThumbDownOutline;

  const likeColor = likeSelected ? "#22c55e" : "white";
  const dislikeColor = dislikeSelected ? "#ef4444" : "white";

  return (
    <View
      className={`flex-row items-center justify-start mt-4 space-x-4 ${className}`}
    >
      {/* Like */}
      <TouchableOpacity
        disabled={disabledAll}
        onPress={() => onChange(1)} // ต้องการให้กดแล้วเป็น 1 ตาม requirement
        className={likeSelected === disabledAll ? "opacity-100" : "opacity-40"}
        accessibilityRole="button"
        accessibilityLabel="Like"
        accessibilityState={{ disabled: disabledAll, selected: likeSelected }}
      >
        <UpIcon size={28} color={likeColor} />
      </TouchableOpacity>

      {/* Dislike */}
      <TouchableOpacity
        disabled={disabledAll}
        onPress={() => onChange(-1)} // กดแล้วเป็น -1
        className={
          dislikeSelected === disabledAll ? "opacity-100" : "opacity-40"
        }
        accessibilityRole="button"
        accessibilityLabel="Dislike"
        accessibilityState={{
          disabled: disabledAll,
          selected: dislikeSelected,
        }}
      >
        <DownIcon size={28} color={dislikeColor} />
      </TouchableOpacity>
    </View>
  );
}
