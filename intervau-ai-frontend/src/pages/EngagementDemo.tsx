import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  CameraOff,
  Focus,
  Brain,
  Zap,
  Github,
  Linkedin,
  Twitter,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEngagementTracking } from "../hooks/useEngagementTracking";
import { EngagementOverlay } from "../components/interview/EngagementOverlay";

const features = [
  {
    icon: Focus,
    title: "Real-time Tracking",
    description:
      "Monitor engagement levels in real time while speaking on camera.",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description:
      "Facial and behavioral signals are analyzed for confidence and focus insights.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description:
      "Get immediate visual metrics to improve posture, eye contact, and consistency.",
  },
];

const team = [
  {
    name: "Khizar Malik",
    role: "Frontend Engineer",
    image: "/team/khizar.jpeg",
    social: {
      github: "https://github.com/khizarrm",
      linkedin: "https://www.linkedin.com/in/khizar--malik/",
      twitter: "#",
    },
  },
  {
    name: "Tendi Sambaza",
    role: "CV Engineer",
    image: "/team/tendi.jpeg",
    social: { github: "#", linkedin: "#", twitter: "#" },
  },
  {
    name: "Divine Jojolola",
    role: "ML Engineer",
    image: "/team/divine.jpg",
    social: { github: "#", linkedin: "#", twitter: "#" },
  },
  {
    name: "Kuro Gboun",
    role: "Backend Engineer",
    image: "/team/kuro.jpeg",
    social: { github: "#", linkedin: "#", twitter: "#" },
  },
];

export default function EngagementDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [streamReady, setStreamReady] = useState(false);

  const sessionId = useMemo(() => `demo-${Date.now()}`, []);

  const {
    isConnected,
    isSessionActive,
    latestMetrics,
    startEngagementTracking,
    stopEngagementTracking,
  } = useEngagementTracking({
    sessionId,
    videoRef,
    enabled: isEnabled && streamReady,
    frameInterval: 700,
    onError: (error) => {
      toast.error(error);
    },
  });

  useEffect(() => {
    const startTracking = async () => {
      if (isEnabled && streamReady && isConnected && !isSessionActive) {
        await startEngagementTracking();
      }
    };

    void startTracking();
  }, [
    isEnabled,
    streamReady,
    isConnected,
    isSessionActive,
    startEngagementTracking,
  ]);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      void stopEngagementTracking();
    };
  }, [stopEngagementTracking]);

  const toggleCamera = async () => {
    if (isEnabled) {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setStreamReady(false);
      setIsEnabled(false);
      await stopEngagementTracking();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStreamReady(true);
      setIsEnabled(true);
    } catch (error) {
      console.error("Camera error", error);
      toast.error("Unable to start camera");
      setStreamReady(false);
      setIsEnabled(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      <motion.div
        initial={{ y: "-100%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="fixed inset-0 wave-animation -z-10 opacity-20"
      />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-emerald-300">
            Lock'd In Experience
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            A dedicated engagement demo merged into the main Intervau frontend.
          </p>
        </motion.section>

        <section className="mb-12 max-w-4xl mx-auto">
          <div
            className={`relative rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/10 ${
              isEnabled ? "camera-glow" : ""
            }`}
          >
            {isEnabled ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full aspect-video object-cover"
                onPlaying={() => setStreamReady(true)}
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center">
                <p className="text-slate-200">Camera disabled</p>
              </div>
            )}

            {isEnabled && latestMetrics && (
              <div className="absolute top-3 left-3 w-64 z-10">
                <EngagementOverlay metrics={latestMetrics} />
              </div>
            )}

            <div className="absolute top-3 right-3 z-10 text-xs px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
              {isConnected ? "Socket Connected" : "Connecting..."}
            </div>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => void toggleCamera()}
              className="absolute bottom-4 right-4 p-3 rounded-full bg-black/60 hover:bg-black/80 transition-colors border border-white/10"
              aria-label={isEnabled ? "Disable camera" : "Enable camera"}
            >
              {isEnabled ? (
                <CameraOff className="w-6 h-6 text-red-300" />
              ) : (
                <Camera className="w-6 h-6 text-cyan-200" />
              )}
            </motion.button>
          </div>
        </section>

        <section className="py-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            About Lock'd In
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <feature.icon className="w-10 h-10 mx-auto mb-4 text-cyan-300" />
                <h3 className="text-xl font-semibold mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-slate-300 text-center text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-10">
          <h2 className="text-3xl font-bold text-center mb-4">Meet Our Team</h2>
          <p className="text-slate-300 text-center mb-10 max-w-2xl mx-auto">
            We are a multidisciplinary team building intelligent interview
            tools.
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12 }}
                className="group"
              >
                <div className="p-5 rounded-xl bg-white/5 border border-white/10 hover:scale-[1.02] transition-transform">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-2 border-cyan-300/40"
                  />
                  <h3 className="text-lg font-semibold text-center">
                    {member.name}
                  </h3>
                  <p className="text-cyan-200 text-sm text-center mb-4">
                    {member.role}
                  </p>

                  <div className="flex justify-center space-x-4">
                    {Object.entries(member.social).map(([platform, link]) => {
                      const Icon = {
                        github: Github,
                        linkedin: Linkedin,
                        twitter: Twitter,
                      }[platform];

                      return (
                        <motion.a
                          key={platform}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          whileHover={{ scale: 1.2 }}
                          className="text-slate-300 hover:text-cyan-200 transition-colors"
                        >
                          <Icon className="w-5 h-5" />
                        </motion.a>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
