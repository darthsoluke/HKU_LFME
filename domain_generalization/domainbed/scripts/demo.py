import glob
import os

import torch
from torchvision import transforms
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np
import domainbed
from domainbed import algorithms, datasets, hparams_registry
import pandas as pd
# domainbed 文件夹的路径
domainbed_path = os.path.dirname(os.path.abspath(domainbed.__file__))
# 想跑的单张图片的路径
img_path = os.path.join(domainbed_path,"data/pacs_data/pacs_data/art_painting/dog/pic_002.jpg")

# 放在 import 之后、函数定义之前
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

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
def predict_single_image(img_path,num_classes):
    x = preprocess_image(img_path)
    logits = model.predict(x)
    probs = torch.softmax(logits,dim = 1)
    pred_class = probs.argmax(dim=1).item()

    print("------------------------------------------------------------------")
    print("Algorithm: ", algorithm_name, "\nInput shape: ", input_shape, "\nNum classes: ", num_classes,
          "\nNum domains: ", num_domains, "\nHyper params: ", hparams)
    print("------------------------------------------------------------------")

    print("Pred class index:", pred_class)

    idx2name = {
        0: "dog",
        1: "elephant",
        2: "giraffe",
        3: "guitar",
        4: "horse",
        5: "house",
        6: "person"
    }

    print(algorithm_name, ": This should be a: ", idx2name[pred_class]," \nSoftmax probability:",probs.squeeze().cpu())

    return pred_class,probs.squeeze().cpu()


@torch.inference_mode()
def predict_images(algorithm_name,num_classes,dictionary_path):
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
def plot_bar_graph_pacs(probs_res,title="PACS"):

    probs = probs_res.detach().flatten().cpu().numpy()

    C = probs.shape[0]
    x = np.arange(C)
    class_names = ["dog", "elephant", "giraffe", "guitar", "horse", "house", "person"]

    plt.figure(figsize=(8,4.5))
    plt.bar(x, probs)  # 不指定颜色，保持默认
    plt.xticks(x, class_names, rotation=30, ha='right')
    plt.ylabel("Probability")
    plt.ylim(0.0, max(1.0, probs.max() * 1.15))
    plt.title(title)
    plt.grid(axis='y', linestyle='--', alpha=0.5)

    # 数值标注
    for xi, yi in zip(x, probs):
        plt.text(xi, yi, f"{yi:.3f}", ha='center', va='bottom', fontsize=9)

    plt.tight_layout()
    save_path=os.path.join(domainbed_path,"Reasoning_figs",title)
    os.makedirs(os.path.dirname(save_path) or ".", exist_ok=True)
    plt.savefig(save_path)


def find_ckpt_path(algo: str, te: int) -> str:
    # 按你的命名：outputs/{ALGO}/{ALGO}_te{te}/PACS{ALGO}domain_generalization0None[{te}].pkl
    path = os.path.join("outputs", algo, f"{algo}_te{te}", f"PACS{algo}domain_generalization0None[{te}].pkl")
    if not os.path.isfile(path):
        raise FileNotFoundError(f"未找到 ckpt: {path}")
    return path

if __name__ == "__main__":

    reasoning_algo_order = ["LFME", "ERM", "CORAL", "Mixup"]
    domains = ["art_painting","cartoon","photo","sketch"]
    classes = ["dog","elephant","giraffe","guitar","house","horse","person"]
    test_envs = [0,1,2,3]



    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    out_dir = os.path.join(domainbed_path, "Reasoning_tables")
    os.makedirs(out_dir, exist_ok=True)

    for reasoning_algo in reasoning_algo_order:
        # 行 = (class, test_env)；列 = 四域
        row_index = pd.MultiIndex.from_product([classes, test_envs], names=["class", "test_env"])
        df = pd.DataFrame(index=row_index, columns=domains)

        for te in test_envs:
            # 1) 只为当前 te 加载一次模型
            ckpt_path = find_ckpt_path(reasoning_algo, te)
            ckpt = torch.load(ckpt_path, map_location=device)

            algorithm_name = ckpt["args"]["algorithm"]
            input_shape    = ckpt["model_input_shape"]
            n_classes      = ckpt["model_num_classes"]  # 不要覆盖 classes 列表
            num_domains    = ckpt["model_num_domains"]
            hparams        = ckpt["model_hparams"]
            state_dict     = ckpt["model_dict"]

            AlgorithmClass = algorithms.get_algorithm_class(algorithm_name)
            model = AlgorithmClass(
                input_shape=input_shape,
                num_classes=n_classes,
                num_domains=num_domains,
                hparams=hparams,
            )
            model.load_state_dict(state_dict)
            model.to(device)
            model.eval()

            # 2) 用该 te 的模型遍历四域×七类，写入同一行 te 的四列
            for domain in domains:
                for entity in classes:
                    img_dic_path = os.path.join(domainbed_path, "data/pacs_data/pacs_data", domain, entity)
                    probs_res = predict_images(algorithm_name=reasoning_algo, num_classes=7,dictionary_path=img_dic_path)
                    cell_str = "N/A" if probs_res is None else str(probs_res)
                    df.loc[(entity, te), domain] = cell_str

        # 3) 一个算法写一个 CSV
        csv_path = os.path.join(out_dir, f"{reasoning_algo}_pacs_reasoning_table.csv")
        df.to_csv(csv_path, encoding="utf-8")
        print(f"[INFO] 已写出：{csv_path}")




