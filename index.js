import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Проксі для отримання токену
app.get("/api/v1/auth/anonymous", async (req, res) => {
    try {
        const response = await fetch(
            "http://api.wisey.app/api/v1/auth/anonymous?platform=subscriptions",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const { token } = await response.json();
        res.status(200).send({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to get token" });
    }
});

// Проксі для отримання списку курсів
app.get("/api/v1/core/preview-courses", async (req, res) => {
    try {
        const tokenResponse = await fetch(
            "http://localhost:5555/api/v1/auth/anonymous",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const { token } = await tokenResponse.json();
        const coursesResponse = await fetch(
            "http://api.wisey.app/api/v1/core/preview-courses",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const courses = await coursesResponse.json();
        res.status(200).send(courses);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to get courses" });
    }
});

// Проксі для отримання курсу по id
app.get("/api/v1/core/preview-courses/:id", async (req, res) => {
    try {
        const tokenResponse = await fetch(
            "http://localhost:5555/api/v1/auth/anonymous",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const { token } = await tokenResponse.json();
        const coursesResponse = await fetch(
            `http://api.wisey.app/api/v1/core/preview-courses/${req.params.id}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const courses = await coursesResponse.json();
        res.status(200).send(courses);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to get courses" });
    }
});


app.listen(5555, () => console.log(`Listening on port 5555`));
