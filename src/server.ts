import express, { Request, Response } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

interface OltOutputBody {
    data: {
        slot: string;
        port: string;
        ont_id: string;
        sn: string;
        state: string;
    }[];
}

app.post(
    "/oltoutput",
    async (req: Request<{}, {}, OltOutputBody>, res: Response) => {
        const { data } = req.body;

        try {
            const createdOutputs = [];
            for (const item of data) {
                const response = await prisma.oltOutput.create({
                    data: {
                        slot: item.slot,
                        port: item.port,
                        ont_id: item.ont_id,
                        sn: item.sn,
                        state: item.state,
                    },
                });
                createdOutputs.push(response);
            }

            console.log("Dados salvos com sucesso no banco de dados.");

            res.status(200).json({
                message: "Dados salvos com sucesso no banco de dados.",
                data: createdOutputs,
            });
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
