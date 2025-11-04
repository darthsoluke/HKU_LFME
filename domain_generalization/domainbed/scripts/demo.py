import glob
import os

import torch
from torchvision import transforms
from PIL import Image

import domainbed
from domainbed import algorithms, datasets, hparams_registry

domainbed_path = os.path.dirname(os.path.abspath(domainbed.__file__))
img_path = os.path.join(domainbed_path,"data/pacs_data/pacs_data/art_painting/dog/pic_414.jpg")
img_dic_path = os.path.join(domainbed_path,"data/pacs_data/pacs_data/sketch/dog")
ckpt_path="outputs/PACS_te3/PACSLFMEdomain_generalization0None[3].pkl"

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
"""
Load Checkpoint file
"""

ckpt = torch.load(ckpt_path, map_location=device)

algorithm_name     = ckpt["args"]["algorithm"]          # "LFME" 或 "ERM"
input_shape        = ckpt["model_input_shape"]          # e.g. (3, 224, 224)
num_classes        = ckpt["model_num_classes"]          # e.g. 7 (PACS有7类)
num_domains        = ckpt["model_num_domains"]          # 源域个数
hparams            = ckpt["model_hparams"]              # 训练时的超参字典
state_dict         = ckpt["model_dict"]                 # 真正的权重

"""
Construct algorithm object
"""
AlgorithmClass = algorithms.get_algorithm_class(algorithm_name)

model = AlgorithmClass(
    input_shape=input_shape,
    num_classes=num_classes,
    num_domains=num_domains,
    hparams=hparams,
)

model.load_state_dict(state_dict)
model.to(device)
model.eval()

transform_eval = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225],
        )
    ]
)

def preprocess_image(image_path):
    img = Image.open(image_path).convert("RGB")
    x = transform_eval(img)
    x=x.unsqueeze(0)
    return x.to(device,non_blocking=True)

"""
Run reasoning
"""
@torch.inference_mode()
def predict_single_image(img_path):
    x = preprocess_image(img_path)
    logits = model.predict(x)
    probs = torch.softmax(logits,dim = 1)
    pred_class = probs.argmax(dim=1).item()

    print("------------------------------------------------------------------")
    print("Algorithm: ", algorithm_name, "\nInput shape: ", input_shape, "\nNum classes: ", num_classes,
          "\nNum domains: ", num_domains, "\nHyper params: ", hparams)
    print("------------------------------------------------------------------")

    print("Pred class index:", pred_class)
    print("Class prob vector:", probs)

    idx2name = {
        0: "dog",
        1: "elephant",
        2: "giraffe",
        3: "guitar",
        4: "horse",
        5: "house",
        6: "person"
    }

    print(algorithm_name, ": This should be a: ", idx2name[pred_class]," softmax:",probs.squeeze())

    return pred_class,probs.squeeze().cpu()


@torch.inference_mode()
def predict_images(algorithm_name,dictionary_path):
    images=[]
    exts = ["jpg","jpeg","png"]
    for ext in exts:
        images.extend(glob.glob(os.path.join(dictionary_path, f"*.{ext}")))
        images.extend(glob.glob(os.path.join(dictionary_path, f"*.{ext.upper()}")))
    images=sorted(images)
    print(f"[INFO] Found {len(images)} images in {dictionary_path}")
    print(f"[INFO] Using algorithm: {algorithm_name}")
    print("--------------------------------------------------")
    probs_sum=torch.zeros(1,num_classes,device=device)

    image_num=0
    for img_path in images:
        try:
            img = Image.open(img_path).convert("RGB")
        except Exception as e:
            print(f"[WARN] 跳过 {img_path}, 无法打开: {e}")
            continue

        image_num+=1
        x = preprocess_image(img_path)
        logits = model.predict(x)
        probs = torch.softmax(logits, dim=1)
        probs_sum+=probs

    probs_res=(probs_sum/image_num).detach().cpu()
    print(probs_res)
    return probs_res


if __name__ == "__main__":
    predict_images(algorithm_name=algorithm_name,dictionary_path=img_dic_path)
