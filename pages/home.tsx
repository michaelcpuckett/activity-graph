import { HomePage } from "../components/HomePage";
import { getServerSideProps as getHomeServerSideProps } from "activitypub-core/src/endpoints/home";
import serviceAccount from "../credentials";
import { NextPageContext } from "next";

export const getServerSideProps = async (context: NextPageContext) => await getHomeServerSideProps(context, serviceAccount);
export default HomePage;