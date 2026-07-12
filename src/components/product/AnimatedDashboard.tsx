import { motion } from "framer-motion";

const AnimatedDashboard = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 text-center">
            <div className="w-40 h-4 bg-muted rounded mx-auto" />
          </div>
        </div>

        <div className="p-5">
          {/* Top metrics row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "Documents", val: "12,847", color: "bg-accent/20" },
              { label: "Processed", val: "98.4%", color: "bg-accent/10" },
              { label: "Storage", val: "2.1 TB", color: "bg-primary/10" },
            ].map((m, i) => (
              <motion.div
                key={m.label}
                className={`${m.color} rounded-xl p-3`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
              >
                <div className="text-[10px] text-muted-foreground mb-1">{m.label}</div>
                <div className="text-sm font-bold text-foreground">{m.val}</div>
              </motion.div>
            ))}
          </div>

          {/* Chart area */}
          <motion.div
            className="bg-muted/30 rounded-xl p-4 mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-end gap-2 h-24">
              {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 92].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-accent/60 rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.8 + i * 0.06, duration: 0.5, ease: "easeOut" }}
                />
              ))}
            </div>
          </motion.div>

          {/* Recent docs list */}
          <div className="space-y-2">
            {[
              { name: "Contract_2024.pdf", tag: "Legal", time: "2s ago" },
              { name: "Invoice_Q3.pdf", tag: "Finance", time: "5s ago" },
              { name: "Report_AR.pdf", tag: "Arabic", time: "12s ago" },
            ].map((doc, i) => (
              <motion.div
                key={doc.name}
                className="flex items-center justify-between bg-muted/20 rounded-lg px-3 py-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 + i * 0.12, duration: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-7 rounded bg-accent/15 flex items-center justify-center">
                    <div className="w-3 h-4 border border-accent/40 rounded-sm" />
                  </div>
                  <span className="text-xs text-foreground font-medium">{doc.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">{doc.tag}</span>
                  <span className="text-[9px] text-muted-foreground">{doc.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification */}
      <motion.div
        className="absolute -top-3 -right-3 bg-accent text-accent-foreground rounded-full px-3 py-1.5 text-xs font-bold shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ delay: 2, duration: 0.4 }}
      >
        +24 new
      </motion.div>
    </div>
  );
};

export default AnimatedDashboard;
