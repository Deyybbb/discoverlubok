/* =====================================================================
   DISCOVER LUBOK · 360° VIRTUAL TOURS
   ---------------------------------------------------------------------
   One entry per place. The key is the place ID (shown in Admin).
   Each scene is one 360° photo (2:1 equirectangular JPG, about 4096×2048).
   "links" are the walking arrows: "to" is the scene to go to, "yaw" is the
   direction of the arrow in degrees (0 = the photo's centre, 90 = right,
   -90 = left, 180 = behind), "pitch" how low it sits (-18 = on the floor).
   "turn" is only needed when the next photo was taken facing another way:
   the number of degrees to add so visitors keep looking the same way.
   ===================================================================== */
window.LOBOC_TOURS = {
 "pl-church": {
  "title": "Loboc Church",
  "start": "outside-1",
  "cover": "assets/tour/loboc-church/inside-06-thumb.jpg",
  "scenes": [
   {
    "id": "outside-1",
    "title": "Church plaza",
    "img": "assets/tour/loboc-church/outside-1.jpg",
    "thumb": "assets/tour/loboc-church/outside-1-thumb.jpg",
    "yaw": -95,
    "pitch": 0,
    "links": [
     {
      "to": "inside-01",
      "yaw": -95,
      "pitch": -10,
      "label": "Enter the church"
     }
    ]
   },
   {
    "id": "inside-01",
    "title": "Main entrance",
    "img": "assets/tour/loboc-church/inside-01.jpg",
    "thumb": "assets/tour/loboc-church/inside-01-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-02",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "outside-1",
      "yaw": 90,
      "pitch": -18,
      "label": "Go outside"
     }
    ]
   },
   {
    "id": "inside-02",
    "title": "Under the choir loft",
    "img": "assets/tour/loboc-church/inside-02.jpg",
    "thumb": "assets/tour/loboc-church/inside-02-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-03",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "inside-01",
      "yaw": 90,
      "pitch": -18,
      "label": "Walk back"
     }
    ]
   },
   {
    "id": "inside-03",
    "title": "Center aisle",
    "img": "assets/tour/loboc-church/inside-03.jpg",
    "thumb": "assets/tour/loboc-church/inside-03-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-04",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "inside-02",
      "yaw": 90,
      "pitch": -18,
      "label": "Walk back"
     }
    ]
   },
   {
    "id": "inside-04",
    "title": "Center aisle",
    "img": "assets/tour/loboc-church/inside-04.jpg",
    "thumb": "assets/tour/loboc-church/inside-04-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-05",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "inside-03",
      "yaw": 90,
      "pitch": -18,
      "label": "Walk back"
     }
    ]
   },
   {
    "id": "inside-05",
    "title": "Center aisle",
    "img": "assets/tour/loboc-church/inside-05.jpg",
    "thumb": "assets/tour/loboc-church/inside-05-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-06",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "inside-04",
      "yaw": 90,
      "pitch": -18,
      "label": "Walk back"
     }
    ]
   },
   {
    "id": "inside-06",
    "title": "Middle of the nave",
    "img": "assets/tour/loboc-church/inside-06.jpg",
    "thumb": "assets/tour/loboc-church/inside-06-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-07",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "inside-05",
      "yaw": 90,
      "pitch": -18,
      "label": "Walk back"
     }
    ]
   },
   {
    "id": "inside-07",
    "title": "Middle of the nave",
    "img": "assets/tour/loboc-church/inside-07.jpg",
    "thumb": "assets/tour/loboc-church/inside-07-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-08",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "inside-06",
      "yaw": 90,
      "pitch": -18,
      "label": "Walk back"
     }
    ]
   },
   {
    "id": "inside-08",
    "title": "Middle of the nave",
    "img": "assets/tour/loboc-church/inside-08.jpg",
    "thumb": "assets/tour/loboc-church/inside-08-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-09",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "inside-07",
      "yaw": 90,
      "pitch": -18,
      "label": "Walk back"
     }
    ]
   },
   {
    "id": "inside-09",
    "title": "Front pews",
    "img": "assets/tour/loboc-church/inside-09.jpg",
    "thumb": "assets/tour/loboc-church/inside-09-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-10",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "inside-08",
      "yaw": 90,
      "pitch": -18,
      "label": "Walk back"
     }
    ]
   },
   {
    "id": "inside-10",
    "title": "Front pews",
    "img": "assets/tour/loboc-church/inside-10.jpg",
    "thumb": "assets/tour/loboc-church/inside-10-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-11",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "inside-09",
      "yaw": 90,
      "pitch": -18,
      "label": "Walk back"
     }
    ]
   },
   {
    "id": "inside-11",
    "title": "Under the dome",
    "img": "assets/tour/loboc-church/inside-11.jpg",
    "thumb": "assets/tour/loboc-church/inside-11-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-12",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "inside-10",
      "yaw": 90,
      "pitch": -18,
      "label": "Walk back"
     }
    ]
   },
   {
    "id": "inside-12",
    "title": "Before the altar",
    "img": "assets/tour/loboc-church/inside-12.jpg",
    "thumb": "assets/tour/loboc-church/inside-12-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-13",
      "yaw": -92,
      "pitch": -18,
      "label": "Walk forward"
     },
     {
      "to": "inside-11",
      "yaw": 90,
      "pitch": -18,
      "label": "Walk back"
     }
    ]
   },
   {
    "id": "inside-13",
    "title": "Main altar",
    "img": "assets/tour/loboc-church/inside-13.jpg",
    "thumb": "assets/tour/loboc-church/inside-13-thumb.jpg",
    "yaw": -92,
    "pitch": 0,
    "links": [
     {
      "to": "inside-12",
      "yaw": 88,
      "pitch": -18,
      "label": "Walk back"
     },
     {
      "to": "inside-14",
      "yaw": 176,
      "pitch": -16,
      "label": "Left side altar",
      "turn": -6
     },
     {
      "to": "inside-15",
      "yaw": 2,
      "pitch": -16,
      "label": "Right side altar",
      "turn": 1
     },
     {
      "to": "top-view-1",
      "yaw": 56,
      "pitch": 8,
      "label": "View from above",
      "turn": 127
     }
    ]
   },
   {
    "id": "inside-14",
    "title": "Left side altar",
    "img": "assets/tour/loboc-church/inside-14.jpg",
    "thumb": "assets/tour/loboc-church/inside-14-thumb.jpg",
    "yaw": -135,
    "pitch": 0,
    "links": [
     {
      "to": "inside-13",
      "yaw": -10,
      "pitch": -16,
      "label": "Back to the main altar",
      "turn": 6
     }
    ]
   },
   {
    "id": "inside-15",
    "title": "Right side altar",
    "img": "assets/tour/loboc-church/inside-15.jpg",
    "thumb": "assets/tour/loboc-church/inside-15-thumb.jpg",
    "yaw": -105,
    "pitch": 0,
    "links": [
     {
      "to": "inside-13",
      "yaw": -177,
      "pitch": -16,
      "label": "Back to the main altar",
      "turn": -1
     }
    ]
   },
   {
    "id": "top-view-1",
    "title": "View from above",
    "img": "assets/tour/loboc-church/top-view-1.jpg",
    "thumb": "assets/tour/loboc-church/top-view-1-thumb.jpg",
    "yaw": -30,
    "pitch": -10,
    "links": [
     {
      "to": "inside-13",
      "yaw": 5,
      "pitch": -35,
      "label": "Go back down",
      "turn": -127
     }
    ]
   }
  ]
 }
};
