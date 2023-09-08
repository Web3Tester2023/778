import { useTranslation } from "react-i18next";
import config from "../../config";
import FadeLeft from "../animations/FadeLeft";
import FadeRight from "../animations/FadeRight";
import BuyForm from "../BuyForm";

const HeaderSection = () => {
  const { t } = useTranslation();
  return (
    <section className="flex flex-1 flex-col justify-center py-6">
      <div className="container flex flex-col items-center gap-16 px-4 lg:flex-row lg:gap-4 lg:px-0">
        <FadeLeft className="w-full lg:w-1/2">
          <h4 className="mb-6 uppercase text-center font-bold leading-relaxed text-white lg:text-left lg:text-3xl">
            <span className="uppercase text-yellow-600">Billion Local Coin Gold:</span>{" "}
            {t("Revolutionizing Gold and Mineral Resource Trading. Get BLCG Now")}
          </h4>

          <p className="mb-6 text-center font-light  shadow-xl leading-relaxed text-white lg:text-left lg:text-xl">
          Welcome,

           Here is where you get on board the BLCG vessel that takes you through the portal which connects to the future of money.
          </p>
          <div className="mb-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <a
              href={config.whitepaper}
              target="_blank"
              className="flex gap-4 rounded-full border-2 border-secondary py-3 px-6 font-bold uppercase text-yellow-600 backdrop-blur-md"
            >
              {t("Roadmap")}
            </a>

            <a
              href={config.whitepaper}
              target="_blank"
              className="flex gap-4 rounded-full border-2 border-secondary py-3 px-6 font-bold uppercase text-yellow-600 backdrop-blur-md"
            >
              {t("Whitepaper")}
            </a>
          </div>
        </FadeLeft>

        <FadeRight className="relative flex w-full justify-center lg:w-1/2">
          <BuyForm />
        </FadeRight>
      </div>
    </section>
  );
};

export default HeaderSection;
