import cors from "cors"
import express from "express"
import router from "./routes/apiRouter.ts"
import { errorHandlerMiddleware } from "./middlewares/error-handler.ts"
import { prisma } from "./database";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";

const app = express()

app.use(cookieParser())
app.use(express.json())
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use('/api', router)
app.use(errorHandlerMiddleware)

async function createDefaultAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPass = process.env.ADMIN_PASSWORD!;

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPass, 10);

    await prisma.user.create({
      data: {
        clientType: "PJ",
        name: "Administrador",
        email: adminEmail,
        password: hashedPassword,
        phone: "00000000000",
        cnpj: "00000000000000",
        street: "-",
        number: "-",
        complement: "-",
        district: "-",
        city: "Rio Claro",
        state: "SP",
        role: "admin",
      },
    });
    
  } else {
    console.log("Usuário admin padrão já existe.");
  }
}

if (process.env.NODE_ENV !== "production") {
  console.log("Rodando em modo de desenvolvimento");
}

const PORT = process.env.PORT || 3000
app.listen(PORT, async () => {
  await createDefaultAdmin();
  console.log(`Server successfully initialized!\nPORT: http://localhost:${PORT}/`);
})
 