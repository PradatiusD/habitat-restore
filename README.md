# habitat-restore

Problem Statement for Habitat for Humanity:

**Challenge Title**: Streamlining Donations and Expanding Outreach

**Description**: Habitat for Humanity, a renowned non-profit organization dedicated to building homes and better communities, faces several operational challenges that your hackathon team can help address:

- Targeting New Audiences
  - Real-Time Inventory Management: Implement a solution that updates the online inventory in real-time, ensuring that customers are aware of available items and reducing discrepancies.

## Background

Before starting any design work, our team decided to take a field trip to the Broward Restore, which was 30 minutes away.

The store manager Mark, was very gracious and spent 30 minutes talking about the store, the mission, the volunteers, and the amazing items that pass through his store.

Some interesting points

- Each store operates like a franchise and typically manages their own outreach, website, etc.
- Some stores, like Los Angeles have an excellent social media presence including viral videos on TikTok.
- Mark just came back from a conference with other Restores where they shared ideas and approaches.
- Independent stores can have their own website, but there is not a central platform for posting or managing inventory.
- The Broward store does not have a website, but they have a facebook page.
  - They move a lot of furniture, and the entire sales floor is typically replaced in a couple of weeks. Because each item is unique, maintaining a website is a lot of overhead.

## Donation Receiving

Mark said that 54% of donations are corporate. Typically the item is scratched, dented, or discontinued.

He typically uses Google Lens to scan the item to get a feel for what the item sells for. From this price, he discounts about 50%.

## Proposal

- A SaaS like platform that is owned and managed by the Habitat for Humanity "Corporate"
- Each store is a "tenant" on the platform and can manage their own inventory.
- The inventory is streamlined using a mobile app (or web app)
  - Receiving takes a photo and adds a 3 star quality rating.
  - App uploads photo to the cloud and uses an image recognition to identify the product.
  - If product is IDed, meta-data and trending price is returned to the app.
    - Price is automatically discounted based on stars: 3-50%, 2-60%, 1-70%
  - If the item is not IDed, the app prompts for metadata and price.
  - If current user is not the manager, the item will need to be approved by the manager.
    - Once approved, the item automatically shows up on the website and in the Point of Sale system.
  - A QR Code sticker is printed and attached to the item.
  - When the item is sold, it is automatically removed from the website.
- The store is online and also re-listed with Google Shopping, Facebook Marketplace, and OfferUp.
- Customers can buy online and pick up in the store within 3 days. If it takes longer than 3 days without a special arrangement, the purchase becomes a donation.
