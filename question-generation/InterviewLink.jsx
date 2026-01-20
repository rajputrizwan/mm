import React from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Copy, List, Mail, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function InterviewLink({ interview_id, formData }) {
  // Dynamically construct full URL on client side
  const getInterviewUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/interview/${interview_id}`;
    }
    return `/interview/${interview_id}`; // fallback for SSR (won't break)
  };

  const onCopyLink = async () => {
    try {
      const url = getInterviewUrl();
      await navigator.clipboard.writeText(url);
      toast("Link Copied");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <Image
        src={"/check.png"}
        alt="check"
        width={200}
        height={200}
        className="w-[100px] h-[100px]"
      />
      <h2 className="font-bold text-lg mt-2">Your AI Interview is Ready!</h2>
      <p className="mt-2">
        Share this link with your candidates to start the interview process
      </p>

      <div className="w-full p-7 mt-6 rounded-lg bg-white">
        <div className="flex items-center justify-between">
          <h2 className="text-bold">Interview Link</h2>
          <h2 className="p-1 px-2 bg-blue-50 text-primary rounded-4xl">
            Valid for 30 Days
          </h2>
        </div>
        <div className="mt-3 flex gap-3 items-center">
          <Input defaultValue={getInterviewUrl()} disabled={true} />
          <Button onClick={onCopyLink}>
            <Copy /> Copy Link
          </Button>
        </div>
        <hr className="my-7" />

        <div className="flex gap-5">
          <h2 className="text-sm text-gray-500 flex gap-2 items-center">
            <Clock className="h-4 w-4" />
            {formData?.Duration}
          </h2>
          <h2 className="text-sm text-gray-500 flex gap-2 items-center">
            <List className="h-4 w-4" />
            {formData?.Duration}
          </h2>
        </div>
      </div>

      <div className="mt-7 bg-white p-5 rounded-lg w-full">
        <h2 className="font-bold">Share Via</h2>

        <div className="flex gap-7 mt-2">
          <Button variant={"outline"}>
            <Mail /> Email
          </Button>
          <Button variant={"outline"}>Slack</Button>
          <Button variant={"outline"}>Whatsapp</Button>
        </div>
      </div>

      <div className="flex w-full gap-5 justify-between mt-6">
        <Link href={"/dashboard"}>
          <Button variant={"outline"}>
            <ArrowLeft /> Back to Dashboard
          </Button>
        </Link>
        <Link href={"/create-interview"}>
          <Button>
            <Plus /> Create New Interview
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default InterviewLink;
