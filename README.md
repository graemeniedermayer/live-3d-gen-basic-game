# (WIP) Live ai 3d generation - Basic Game
The goal of this project is to explore basic 3d generation (with rigged animations) live in a game. 

# Current issues
- [ ] animation mixer is poorly calibrated.
- [ ] animation mixing isn't correct with camera movement
- [ ] enemy and game ai are unfinished.
- [ ] lots

### Finished
- [x] There are animations!
- [x] There is a UI!

# Dependencies
Using https://github.com/graemeniedermayer/3d-depth-gen
https://github.com/thygate/stable-diffusion-webui-depthmap-script (i'm using this branch https://github.com/graemeniedermayer/stable-diffusion-webui-normalmap-script/tree/depth_face_upsampler)
https://github.com/pmndrs/uikit (for UI)

# Citations
(might be incomplete right now)

@inproceedings{depthanything,
      title={Depth Anything: Unleashing the Power of Large-Scale Unlabeled Data}, 
      author={Yang, Lihe and Kang, Bingyi and Huang, Zilong and Xu, Xiaogang and Feng, Jiashi and Zhao, Hengshuang},
      booktitle={CVPR},
      year={2024}
}

@InProceedings{Qin_2020_PR,
title = {U2-Net: Going Deeper with Nested U-Structure for Salient Object Detection},
author = {Qin, Xuebin and Zhang, Zichen and Huang, Chenyang and Dehghan, Masood and Zaiane, Osmar and Jagersand, Martin},
journal = {Pattern Recognition},
volume = {106},
pages = {107404},
year = {2020}
}
