import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import MoreVertIcon from "@mui/icons-material/MoreVert";

// Sample data imported from JSON or passed as a prop
const videoData = [
  {
    id: "0BGmejDU5s",
    title:
      "Shaamat - Lofi (Slowed + Reverb) | Ankit Tiwari, Tara Sutaria | SR Lofi",
    link: "https://www.youtube.com/watch?v=_0BGmejDU5s&list=RD_0BGmejDU5s&start_radio=1",
    thumbnail: "https://img.youtube.com/vi/_0BGmejDU5s/hqdefault.jpg",
    subTitle: "Lofi Music",
  },
  {
    id: "RKTBa40J4Qw",
    title: "Galliyan Returns - Lofi (Slowed + Reverb) | Ankit Tiwari | SR Lofi",
    link: "https://www.youtube.com/watch?v=RKTBa40J4Qw&list=RD_0BGmejDU5s&index=6",
    thumbnail: "https://img.youtube.com/vi/RKTBa40J4Qw/hqdefault.jpg",
    subTitle: "Lofi Music",
  },
  {
    id: "EWIay_vyFMk",
    title:
      "Khwaab Music Video I ‪@faheemabdullahworld‬ ‪@phomusic‬ I ‪@MureenShahmiri‬ I Riva Arora",
    link: "https://www.youtube.com/watch?v=EWIay_vyFMk&list=RDEWIay_vyFMk&start_radio=1",
    thumbnail: "https://img.youtube.com/vi/EWIay_vyFMk/hqdefault.jpg",
    subTitle: "Khwaab Music Video",
  },
  {
    id: "MEBU71lR7b8",
    title: "Aaj Bhi (Slowed + Reverb) | Vishal Mishra | SR Lofi",
    link: "https://www.youtube.com/watch?v=MEBU71lR7b8&list=RDMEBU71lR7b8&start_radio=1",
    thumbnail: "https://img.youtube.com/vi/MEBU71lR7b8/hqdefault.jpg",
    subTitle: "Aaj Bhi - Lofi",
  },
  {
    id: "JAnYzWpBhAw",
    title:
      "E Kon Maya | এ কোন মায়া | Shamiul Shezan | Lofi | New Bangla Song 2025 | Official Lyric Video",
    link: "https://www.youtube.com/watch?v=JAnYzWpBhAw&list=RDJAnYzWpBhAw&start_radio=1",
    thumbnail: "https://img.youtube.com/vi/JAnYzWpBhAw/hqdefault.jpg",
    subTitle: "E Kon Maya - Lofi",
  },
  {
    id: "RKTBa40J4Qw",
    title: "Galliyan Returns - Lofi (Slowed + Reverb) | Ankit Tiwari | SR Lofi",
    link: "https://www.youtube.com/watch?v=RKTBa40J4Qw&list=RD_0BGmejDU5s&index=6",
    thumbnail: "https://img.youtube.com/vi/RKTBa40J4Qw/hqdefault.jpg",
    subTitle: "Lofi Music",
  },
  {
    id: "EWIay_vyFMk",
    title:
      "Khwaab Music Video I ‪@faheemabdullahworld‬ ‪@phomusic‬ I ‪@MureenShahmiri‬ I Riva Arora",
    link: "https://www.youtube.com/watch?v=EWIay_vyFMk&list=RDEWIay_vyFMk&start_radio=1",
    thumbnail: "https://img.youtube.com/vi/EWIay_vyFMk/hqdefault.jpg",
    subTitle: "Khwaab Music Video",
  },
  {
    id: "MEBU71lR7b8",
    title: "Aaj Bhi (Slowed + Reverb) | Vishal Mishra | SR Lofi",
    link: "https://www.youtube.com/watch?v=MEBU71lR7b8&list=RDMEBU71lR7b8&start_radio=1",
    thumbnail: "https://img.youtube.com/vi/MEBU71lR7b8/hqdefault.jpg",
    subTitle: "Aaj Bhi - Lofi",
  },
  {
    id: "JAnYzWpBhAw",
    title:
      "E Kon Maya | এ কোন মায়া | Shamiul Shezan | Lofi | New Bangla Song 2025 | Official Lyric Video",
    link: "https://www.youtube.com/watch?v=JAnYzWpBhAw&list=RDJAnYzWpBhAw&start_radio=1",
    thumbnail: "https://img.youtube.com/vi/JAnYzWpBhAw/hqdefault.jpg",
    subTitle: "E Kon Maya - Lofi",
  },
];

interface MainContentProps {
  isSidebarExpanded: boolean;
}

const MainContent: React.FC<MainContentProps> = ({ isSidebarExpanded }) => {
  return (
    <Box
      sx={{
        marginLeft: isSidebarExpanded ? 30 : 10,
        marginTop: 10,

        overflowY: "auto",
      }}
      px={4}
      py={2}
    >
      <Grid container spacing={2}>
        {videoData.map((video) => (
          <Grid size={{ xs: 12, md: 4, lg: 4 }} key={video.id}>
            <Box
              sx={{
                borderRadius: 2,
                maxWidth: 550,
                minHeight: 350,
              }}
            >
              <Box
                style={{
                  height: 300,
                  backgroundImage: `url(${video.thumbnail})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "transform 0.3s ease-in-out",
                }}
                onClick={() => window.open(video.link, "_blank")}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              />
              <Box sx={{ paddingTop: 2, paddingBottom: 2 }}>
                <Box display={"flex"} justifyContent={"space-between"} gap={1}>
                  {" "}
                  <SlowMotionVideoIcon sx={{ color: "#888", fontSize: 46 }} />
                  <Box>
                    {" "}
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      <a
                        href={video.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "inherit",
                          textDecoration: "none",
                          display: "block",
                          lineHeight: 1.5,
                        }}
                      >
                        {video.title}
                      </a>
                    </Typography>
                    <Typography
                      sx={{
                        color: "#888",
                        fontSize: 14,
                        marginTop: 1,
                      }}
                    >
                      {video.subTitle}
                    </Typography>
                  </Box>
                  <MoreVertIcon sx={{ color: "#888", fontSize: 24 }} />
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MainContent;
