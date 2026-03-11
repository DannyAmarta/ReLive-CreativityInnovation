// 


<motion.div
            initial={{ opacity: 0, scale: 0.8, y: 80 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -12, 0]
            }}
            transition={{
              opacity: { duration: 0.8 },
              scale: { duration: 0.8 },
              y: {
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}

            className="
              relative
              rounded-2xl
              p-10
              w-full
              max-w-md
              bg-white/10
              backdrop-blur-xl
              border
              border-white/20
              shadow-[0_0_80px_rgba(56,189,248,0.4)]"
        >
          <div
            className="
            absolute inset-0
            rounded-2xl
            pointer-events-none
            backdrop-blur-xl
            before:absolute
            before:inset-0
            before:bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)]
            "
          />
            <div className="absolute inset-0 rounded-2xl pointer-events-none animate-pulse bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-xl" />

            {children}
        </motion.div>
    );