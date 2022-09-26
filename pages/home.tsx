import { HomePage } from "../components/HomePage";
import { getServerSideProps as getHomeServerSideProps } from "activitypub-core/endpoints/get/home";
import serviceAccount from "../credentials";

export const getServerSideProps = getHomeServerSideProps(serviceAccount);
export default HomePage;