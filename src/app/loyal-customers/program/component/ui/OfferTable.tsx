"use client";

import React from "react";
import { Offer } from "../../../../models/Offer";
import { Table, TableWrapper } from "./TableWrapper";

interface OfferTableDropdownProps {
  isFixed: boolean;
  isPercentage: boolean;
  isFreeShipping: boolean;
  isFreeGift: boolean;
  offer: Offer;
}

const OfferTableDropdown: React.FC<OfferTableDropdownProps> = ({
  isFixed,
  isPercentage,
  isFreeShipping,
  isFreeGift,
  offer,
}) => {
  return (
    <div>
      {isFixed ? (
        // ✅ FIXED AMOUNT DISCOUNT
        <TableWrapper title="Discount Tiers">
          <Table headers={["Tier", "Discount (€)"]} rows={[
            ["Bronze", "€14"],
            ["Silver", "€35"],
            ["Gold", "€49"],
            ["Platinum", "€80"],
          ]} />
        </TableWrapper>
      ) : isPercentage ? (
        // ✅ PERCENTAGE DISCOUNT
        <TableWrapper title="Discount Tiers (France only)">
          <Table headers={["Tier", "Discount (%)"]} rows={[
            ["Bronze", "10%"],
            ["Silver", "10%"],
            ["Gold", "10%"],
            ["Platinum", "15%"],
          ]} />
        </TableWrapper>
      ) : isFreeShipping ? (
        // ✅ FREE SHIPPING
        <TableWrapper title="Free Shipping Eligibility">
          <Table headers={["Tier", "Condition"]} rows={[
            ["Bronze", " No free shipping"],
            ["Silver", "On next order"],
            ["Gold", "On next order"],
            ["Platinum", "As long as status is active"],
          ]} />
        </TableWrapper>
      ) : isFreeGift ? (
        // 🎁 FREE GIFT
        <TableWrapper title="Free Gift Rewards">
          <Table headers={["Tier", "Gift"]} rows={[
            ["Bronze", "Zipped Pouch"],
            ["Silver", "1 Cozy Plaid"],
            ["Gold", "1 Cocooning Product"],
            ["Platinum", "1 Faux Plaid"],
          ]} />
        </TableWrapper>
      ) : offer.offerType === "EARLY_ACCESS" ? (
        // 🛍️ EARLY ACCESS TO PRIVATE SALES
        <TableWrapper title="Early Access to Private Sales">
          <Table headers={["Tier", "Access"]} rows={[
            ["Bronze", "No access"],
            ["Silver", "Day 1 Access"],
            ["Gold", "Day 1 Access"],
            ["Platinum", "Day 2 Access"],
          ]} />
        </TableWrapper>
      ) : null}
    </div>
  );
};

export default OfferTableDropdown;
