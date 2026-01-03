const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://codedge.online",
    "https://www.codedge.online",
    "https://dev-project-mu.vercel.app",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export default corsOptions;
