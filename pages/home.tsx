import { HomePage } from "../components/HomePage";
import { getServerSideProps as getHomeServerSideProps } from "activitypub-core/src/endpoints/home";
import serviceAccount from "../credentials";
import { NextPageContext } from "next";
import { IncomingMessage } from "http";

export const getServerSideProps = async (context: NextPageContext) => await getHomeServerSideProps(context as unknown as {
  req: IncomingMessage & {
    cookies: {
      __session: string;
    }
  }
}, serviceAccount);
export default HomePage;