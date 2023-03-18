import express from "express";
import cors from "cors";
import http from "http";
import httpProxy from "http-proxy";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(function (req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
//     res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//     if (req.method === "OPTIONS") {
//         res.send(200);
//     } else {
//         next();
//     }
// });

// app.get("/get-token-and-data/?:id?", async (req, res) => {
//     try {
//         const response = await fetch(
//             "http://api.wisey.app/api/v1/auth/anonymous?platform=subscriptions",
//             {
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         if (!response.ok) {
//             throw new Error("Failed to retrieve token");
//         }

//         const { token } = await response.json();
//         const id = req.params.id;
//         const dataResponse = await fetch(
//             `http://api.wisey.app/api/v1/core/preview-courses/${id ? id : ""}`,
//             {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             }
//         );

//         if (!dataResponse.ok) {
//             throw new Error("Failed to retrieve data");
//         }

//         const data = await dataResponse.json();

//         res.json(data);
//     } catch (error) {
//         res.status(500).json({
//             message: error.message,
//         });
//     }
// });

// app.get("/get-video", async (req, res) => {
//     try {
//         const videoId = req.query.videoId; // Отримуємо videoId з параметрів запиту
//         let videoUrl = videoId.toString();
//         const response = await fetch(videoUrl);
//         const video = await response.buffer(); // Отримуємо відео в форматі буфера
//         console.log(video)
//         res.setHeader("Content-Type", "application/vnd.apple.mpegurl"); // Встановлюємо MIME-тип відео
//         res.send(video); // Відправляємо відео на фронтенд
//     } catch (error) {
//         res.status(500).json({
//             message: error.message,
//         });
//     }
// });

// app.listen(4444, () => {
//     console.log("Server Start");
// });

//!проксі
// const wiseyApiProxy = createProxyMiddleware('/api/v1', {
//     target: 'https://api.wisey.app',
//     changeOrigin: true,
//   });
//   const wiseyWebProxy = createProxyMiddleware('/', {
//     target: 'https://wisey.app',
//     changeOrigin: true,
//   });

//   app.use('/api/v1/auth', wiseyApiProxy); // для запитів на http://api.wisey.app/api/v1/auth/anonymous?platform=subscriptions
//   app.use('/', wiseyWebProxy); // для запитів на https://wisey.app/videos/
//   app.use('/api/v1/core', wiseyApiProxy); // для запитів на http://api.wisey.app/api/v1/core/preview-courses

// app.listen(5555, () => {
//     console.log("Проксі-сервер запущено на порті 5555");
// });

//!проксі 2
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

// Проксі для отримання відео
app.get("/videos/:id", async (req, res) => {
    try {
        const videoUrl = `https://wisey.app/videos/${req.params.id}`;
        const videoResponse = await fetch(videoUrl);
        console.log(videoResponse.body)
        res.status(200).send(videoResponse.body);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to get video" });
    }
});

app.listen(5555, () => console.log(`Listening on port 5555`));
