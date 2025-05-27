// import { PrismaClient } from '@prisma/client'

import { prisma } from "@/lib/db/prisma"

// const prisma = new PrismaClient()


 function main() {
  // // Create a sample user
  // const user = await prisma.user.create({
  //   data: {
  //     name: 'Test User',
  //     email: 'test@example.com',
  //   },
  // })

  // // Create a trip
  // const trip = await prisma.trip.create({
  //   data: {
  //     userId: user.id,
  //     tourName: 'Karachi fusion',
  //     destination: 'Paris, France',
  //     startDate: new Date('2025-05-06'),
  //     endDate: new Date('2025-05-13'),
  //     budgetMin: 5000,
  //     budgetMax: 500,
  //     preferences: {
  //       create: {
  //         groupType: 'couple',
  //         travelStyle: 'adventure',
  //         pace: 'moderate',
  //       },
  //     },
  //     interests: {
  //       create: [
  //         { interest: 'food' },
  //         { interest: 'culture' },
  //       ],
  //     },
  //     accommodations: {
  //       create: [
  //         {
  //           name: 'Movenpick Hotel Karachi',
  //           type: 'Luxury',
  //           rating: 4.5,
  //           pricePerNight: 15000,
  //           description: 'A luxurious stay with stunning city views, multiple dining options including international cuisine, and a rooftop pool. Close proximity to cultural attractions.',
  //           bookingUrl: 'https://www.movenpick.com/en/asia/pakistan/karachi/hotel-karachi/overview.html',
  //           image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AXQCQNRJtE5TJHwVg3lCJfl6an78_QzLwuUjkt0uP7FikrndVZasPC5cNR3Zd13hSJWGS9cNcD1OTPNMdJHY-oXP_D_coR90xO4vq2wpHha9VGN9B8V4Ifj_fI1-JLjYb9c6I_B2JcmuD6vxjZPO7I0wUBV5aNCRxpJhg5Jq1stgmuh4Daoi6lWvT7S5OHIVXFczNGFfPAsTzL3_XhxXaV46hKyCsjUx4wv1Q3yht8Bq5oAn8H6BJOdHPocmVoiWPzPoNCtK22PrpFGj87tGEowQaX8oe2A2ux8Q1YqVB-OcjFYjLtyarVI&key=AIzaSyC78gkQMNzUvib2zk1UfHi9j3OPGajko-Y',
  //           amenities: {
  //             create: [
  //               { name: 'Spa' },
  //               { name: 'Pool' },
  //               { name: 'Fitness Center' },
  //               { name: 'Multiple Restaurants' },
  //               { name: 'Concierge' },
  //             ],
  //           },
  //         },
  //         {
  //           name: 'Avari Towers Karachi',
  //           type: 'Mid-range',
  //           rating: 4.2,
  //           pricePerNight: 8000,
  //           description: 'A well-regarded hotel offering comfortable rooms, a variety of dining options, and a central location ideal for exploring Karachi. Known for good service and value.',
  //           bookingUrl: 'https://www.avari.com/towers/karachi/',
  //           image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AXQCQNQU6d3ITZgzAc2Tv_PhduwXiAlB8Zk-fClnhOqAMiDRpxJBoMB8hMaOPTJvQZ93YcgTJ-LOFubLKSPeEjC_1uL5XDGx6APO3fmqU3EUjQ4V3uXoq3zMDKACOvLCTauFOYBsGks_C15icrNrN18nFc2cRJ1MlOe64WiLvD23mfKMmqkZAFg4unynJA3jWwxRaWHfRVmxB8qTaRIuV3WENng00Ee0JW8FuxTQ6UFKAf7RuGHHDCJOWnIZ2YEpTLauCRy0pK4MDA_F_re0_WwhpmURaBE-IyY8mUW2TuO034zwbLVNyUVt0hGP6TaszadXf_Mwb-D2ltt7HrjCkb3eZnGxVEtC6OSzQAVhFMbGSMED6VWB79RWDlVjCfViQUW9yhqGuz8gJkaXeauIYFRlHL0KqUt9HwwEw2K45wgoF6GRoNSAtTsQj00lqVimx9oXzeMQD0bXa0x4wqzhZ9SGiDdEyZpgMOWp7RFWH2pD8XDt1oI3rLGu2uPrB5IDeINqFXUJGtZifTXPhp3GUGJ3pCn2buMM6oE7fmSxU_RL1XcZnmLt5euPYK-rVCpyOEcyLs6-gfm9vjVPjQ&key=AIzaSyC78gkQMNzUvib2zk1UfHi9j3OPGajko-Y',
  //           amenities: {
  //             create: [
  //               { name: 'Pool' },
  //               { name: 'Fitness Center' },
  //               { name: 'Business Center' },
  //               { name: 'Restaurants' },
  //               { name: 'Wi-Fi' },
  //             ],
  //           },
  //         },
  //       ],
  //     },
  //     days: {
  //       create: [
  //         {
  //           dayNumber: 1,
  //           date: new Date('2025-04-30'),
  //           transportation: {
  //             create: {
  //               description: 'Ride-sharing apps or taxis are recommended.',
  //             },
  //           },
  //           places: {
  //             create: [
  //               {
  //                 name: 'Quaid-e-Azam Mausoleum',
  //                 type: 'attraction',
  //                 description: 'A national monument and resting place of the founder of Pakistan, showcasing impressive architecture and historical significance.',
  //                 location: 'M.A. Jinnah Road, Karachi',
  //                 timeOfDay: 'morning',
  //                 duration: '2-3 hours',
  //                 image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AXQCQNRWywj6pLaoqQ38l_dCMvIvK2o7OjrVxYBc0Cx0znBJmkOcRuVLlDEofwPORBGaDqL4le4V7OUcNBbiQK7OOQU4zAc8PtoidegjuhuKNCN-pQDpdv7BgfAX61rmAxqPze92_6A2UQaJ-EXrTn5WwFDr1ta-9YjNWpGi7VREX4yKuDGq7lMosbBcHHM2E_5oJTW9L9a_k93JwONL3OzH2R291CVmPHZKIDDPSg9PP1kxg6zCPtXwRO9FHtxdcX4zlHMNZ_24TfU11CkTyOAQZlYRVJ32o9C6P2cSglNIph7F4Fe1R-dsTmw0_cNgdB3h532uk2XceCDr49yfNdWlnm7JnEPURXD72L2B2urQKe4UqtkvwmuQnDhZYyPfMoNZw9zFDSjHnW68D57JdVKhRKaG9h2zST0NzLl00XZpRghlkldnG9XCAvPz14owXTh_leJeSAz_343x4NFmfi49aPYQR9ylnQxOc481ezbTYD-BzhAD-ZA-tDl_m6mhoJgMNHwQCe-cBpxTY1E7C-xKfS0kt8by0tjlqD2qKGFStxnwUyfkcniy955wnHdA9Qh_k5AkoWtqG81vtA&key=AIzaSyC78gkQMNzUvib2zk1UfHi9j3OPGajko-Y',
  //                 attraction: {
  //                   create: {
  //                     category: 'Historical',
  //                   },
  //                 },
  //               },
  //               {
  //                 name: 'Kolachi Restaurant',
  //                 type: 'restaurant',
  //                 description: 'Offers traditional Pakistani and continental cuisine with a beautiful view of the Arabian Sea.',
  //                 location: 'Do Darya, Phase 8, DHA, Karachi',
  //                 timeOfDay: 'afternoon',
  //                 duration: '1.5-2 hours',
  //                 image: 'https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=AXQCQNR_0OoJ3c2_8-MtN4xFl8s11Dk85J7SCXhAZHTPwMCnTKBc3A8Dr5ZPojXlX3kmX8kAokFBYaSAbNeSiRES4kutw-JkJ_zkUShXOl-8BwOc3ItCEhq2GMgqgtp5Yahci1_tv6MyQLQi-r26JVD_JIbg3WFNmjsJkxd0t4S7ppYubTJzAToVwLXNbfUU1VqPKqqYZFI3GKeWkb4AZ_Sim5k7G_Y5NQ25iwUQyvsbQsJccS0LqxmGU8m-qpUgsUgjcFOkUfWNXTk3BkJBaHtmeOFZNqLviZSs7kYKHa4Lvm4G_68RnzUpHJizdRO8QBIiOR2EonilBh6zvfqga62NPsHqZbObKOjFLSPBGxLqVHGYGoiaaNXzcxWbjCbV-wbxsBP1768eHBSCAB2RYBqdMHCv6I9YAwswuY4cKzRXBTqilV263XGSOztK1h6JAQCLogzOGNXKC8Ms-4SCBh3rylDaIP5sOuIfERPc0pTD3LW09WnpgMZHdlxVrtmiJjW5cVujsMQROwc0u9Ij1MFDiCmgZ5YHkthvmZvIHkKvQVxm52kK93Q1uyOwPawNUnBXV8yRqVmwGPZZiQ&key=AIzaSyC78gkQMNzUvib2zk1UfHi9j3OPGajko-Y',
  //                 restaurant: {
  //                   create: {
  //                     cuisine: 'Pakistani, Continental',
  //                     priceRange: 'Mid-range to High-end',
  //                   },
  //                 },
  //               },
  //             ],
  //           },
  //         },
  //       ],
  //     },
  //   },
  // })

  console.log('hello world')
}
main();
// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   }) 