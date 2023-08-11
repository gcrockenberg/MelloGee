import { ICatalogBrand } from "./catalog-brand.model";
import { ICatalogType } from "./catalog-type.model";

export interface ICatalogItem {
    id: number;
    name: string;
    description: string | undefined;
    price: number;
    pictureUri: string;
    catalogBrandId: number;
    catalogBrand: ICatalogBrand;
    catalogTypeId: number;
    catalogType: ICatalogType;
    units: number;
    isNew: boolean;
}
