import http from "k6/http";
import { sleep } from "k6";
export const options = {
  vus: 200,
  duration: "10s",
};
export default function () {
  http.get("http://localhost:8888/apache");
  sleep(3);
}
