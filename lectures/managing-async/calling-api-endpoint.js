import axios from "axios";

const response = axios.request({
    method: "post",
    url: "http://localhost:4000/todos",
    data: {
        task: "Task-1",
        status: "todo",
    },
});

response
    .then(() => {
        console.log("Hello");
    })
    .catch((err) => {
        console.log(err);
    });
