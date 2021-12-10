import { Home } from "./Home/Home";
const routes : {
    path: string,
    element: React.ReactElement,
    title?: string
}[] = [{ path: '', element: <Home />, title: 'Home' }]

export default routes;