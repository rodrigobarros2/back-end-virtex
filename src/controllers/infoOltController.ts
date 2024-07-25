import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createInfoOlt = async (req: Request, res: Response) => {
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
                    olt_type: item.olt_type,
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
};

export const getInfoOlt = async (req: Request, res: Response) => {
    try {
        const data = await prisma.oltOutput.findMany();
        res.json(data);
    } catch (err) {
        console.error("Erro ao obter os dados:", err);
        res.status(500).send("Erro ao obter os dados");
    }
};
