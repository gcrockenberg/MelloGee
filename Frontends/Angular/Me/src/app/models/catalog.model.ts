
export interface ICatalog {
    pageIndex: number;
    data: ICatalogItem[];
    pageSize: number;
    count: number;
}

export interface ICatalogType {
    id: number;
    type: string;
}

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

export interface ICatalogBrand {
    id: number | null;
    brand: string;
}