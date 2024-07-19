import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

interface OltOutputBody {
    slot: string;
    port: string;
    ont_id: string;
    sn: string;
    state: string;
}

app.post(
    "/oltoutput",
    async (req: Request<{}, {}, OltOutputBody>, res: Response) => {
        const { slot, port, ont_id, sn, state } = req.body;

        try {
            const oltOutput = await prisma.oltOutput.create({
                data: { slot, port, ont_id, sn, state },
            });
            res.json(oltOutput);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao criar o registro" });
        }
    }
);

app.get("/oltoutput", async (req: Request, res: Response) => {
    try {
        const oltOutput = await prisma.oltOutput.findMany();
        res.status(200).json(oltOutput);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao listar os registros" });
    }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
