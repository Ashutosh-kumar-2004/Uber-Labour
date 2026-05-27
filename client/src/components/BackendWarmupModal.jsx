import React, { useEffect, useRef, useState } from "react";

export default function BackendWarmupModal({
  pingPath = "/health",
  interval = 3000,
  maxAttempts = Infinity,
  onSuccess,
}) {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("connecting"); // connecting | online
  const [attempts, setAttempts] = useState(0);
  const [exiting, setExiting] = useState(false);
  const timerRef = useRef(null);
  const mountedRef = useRef(false);
  const [typingText, setTypingText] = useState("");

  const apiBase = import.meta.env.VITE_API_URL || "";
  const url = `${apiBase.replace(/\/$/, "")}${pingPath.startsWith("/") ? pingPath : `/${pingPath}`}`;

  useEffect(() => {
    mountedRef.current = true;

    const checkOnce = async () => {
      try {
        const res = await fetch(url, { method: "GET" });
        if (!res.ok) return false;
        const data = await res.json();
        return !!(data && data.success);
      } catch (err) {
        return false;
      }
    };

    (async () => {
      // immediate probe
      const ok = await checkOnce();
      if (ok) {
        setStatus("online");
        setAttempts(1);
        if (onSuccess) onSuccess();
        // show success toast briefly
        setVisible(true);
        setTimeout(() => {
          setExiting(true);
          setTimeout(() => setVisible(false), 1500);
        }, 700);
        return;
      }

      // otherwise show toaster and start polling
      setVisible(true);

      timerRef.current = setInterval(async () => {
        setAttempts((a) => {
          const na = a + 1;
          if (na >= maxAttempts) {
            clearInterval(timerRef.current);
          }
          return na;
        });

        const ok2 = await checkOnce();
        if (ok2 && mountedRef.current) {
          setStatus("online");
          if (onSuccess) onSuccess();
          clearInterval(timerRef.current);

          // show success then exit
          setTimeout(() => {
            setExiting(true);
            setTimeout(() => setVisible(false), 1500);
          }, 700);
        }
      }, interval);
    })();

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // do NOT lock page scrolling — keep default behavior

  // typewriter effect for 'Connecting...'
  useEffect(() => {
    let mounted = true;
    let index = 0;
    const full = "Connecting...";
    let forward = true;
    let timeout;

    const tick = () => {
      if (!mounted) return;
      if (status !== "connecting") {
        setTypingText("");
        return;
      }

      if (forward) {
        index++;
        setTypingText(full.slice(0, index));
        if (index === full.length) {
          forward = false;
          timeout = setTimeout(() => {
            index = 0;
            forward = true;
            setTypingText("");
            timeout = setTimeout(tick, 300);
          }, 700);
          return;
        }
      }

      timeout = setTimeout(tick, 80);
    };

    if (visible && status === "connecting") tick();

    return () => {
      mounted = false;
      if (timeout) clearTimeout(timeout);
    };
  }, [visible, status]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* light, non-blocking overlay (keeps page interactive/scrollable) */}
      <div
        className={`absolute inset-0 bg-white/0 transition-opacity duration-300 ${exiting ? "opacity-0" : "opacity-100"}`}
      />

      {/* Toaster container */}
      <div className="pointer-events-none fixed right-4 bottom-6 flex flex-col items-end gap-4 p-4 z-60">
        <div
          className={`pointer-events-auto w-full max-w-sm rounded-lg border border-gray-200 bg-white shadow px-4 py-3 transform transition-all duration-300 ease-out ${
            exiting ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              {/* simple CSS spinner - no graphics */}
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-600 animate-spin" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-gray-900 font-semibold">
                We are starting our servers...
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status === "online" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {status === "online" ? (
                    "Servers Online"
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <span className="font-mono text-sm">{typingText}</span>
                      <span className="h-4 w-px bg-gray-400 animate-pulse inline-block" />
                    </span>
                  )}
                </div>
              </div>

              {status === "online" && (
                <div className="mt-3 text-sm text-green-700 font-semibold">
                  Servers Connected Successfully
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
