interface ICrime {
    category: string;
    outcome_status: { [key: string]: string } | null;
    location: any;
}

export = ICrime;