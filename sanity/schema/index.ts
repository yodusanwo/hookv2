import { seo } from "./objects/seo";
import { productReference } from "./objects/productReference";
import { collectionReference } from "./objects/collectionReference";
import { cta } from "./objects/cta";

import { heroBlock } from "./blocks/hero";
import { catchOfTheDayBlock } from "./blocks/catchOfTheDay";
import { exploreProductsBlock } from "./blocks/exploreProducts";
import { ourStoryBlock } from "./blocks/ourStory";
import { ourStoryExtendedBlock } from "./blocks/ourStoryExtended";
import { dealPromotionsBlock } from "./blocks/dealPromotions";
import { reviewsBlock } from "./blocks/reviews";
import { recipesBlock } from "./blocks/recipes";
import { docksideMarketsBlock } from "./blocks/docksideMarkets";
import { upcomingEventsBlock } from "./blocks/upcomingEvents";
import { localFoodsCoopsBlock } from "./blocks/localFoodsCoops";
import { faqBlock } from "./blocks/faq";
import { whyWildMattersBlock } from "./blocks/whyWildMatters";

import { page } from "./documents/page";
import { collectionPage } from "./documents/collectionPage";
import { siteSettings } from "./documents/siteSettings";

export const schemaTypes = [
  seo,
  productReference,
  collectionReference,
  cta,
  heroBlock,
  catchOfTheDayBlock,
  exploreProductsBlock,
  ourStoryBlock,
  ourStoryExtendedBlock,
  dealPromotionsBlock,
  reviewsBlock,
  recipesBlock,
  docksideMarketsBlock,
  upcomingEventsBlock,
  localFoodsCoopsBlock,
  faqBlock,
  whyWildMattersBlock,
  page,
  collectionPage,
  siteSettings,
];
