from roboflow import Roboflow
import os

# Create target directory if not exists
target_dir = r"d:\lombapuai\ml-training\datasets"
os.makedirs(target_dir, exist_ok=True)

# Change directory to target_dir so roboflow downloads there
os.chdir(target_dir)

rf = Roboflow(api_key="SVudZsk83foPt6TvfOJ1")
project = rf.workspace("wisnus-workspace-9yifg").project("conteo-de-colonias-pf-c0eoe")
version = project.version(1)

print("Starting download for 'Conteo de colonias PF' (COCO Segmentation format)...")
dataset = version.download("coco-segmentation")
print(f"Download complete! Dataset saved in: {dataset.location}")
