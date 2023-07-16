export interface ICatalogItem {
    id: number;
    name: string;
    description: string | undefined;
    price: number;
    pictureUri: string;
    catalogBrandId: number;
    catalogBrand: string | undefined;
    catalogTypeId: number;
    catalogType: string | undefined;
    units: number;
}
