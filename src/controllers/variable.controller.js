

export const getVariablePeople = async (req, res) => {
    try {
        const result = await getVariablePeople(req);
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
