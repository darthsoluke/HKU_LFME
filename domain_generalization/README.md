# pytorch-LFE

This is a pytorch implementation of: LFME: A Simple Framework for Learning from Multiple Experts in Domain
Generalization. We use the data-spllit, pre-process, hyper-parameter settings, and evaluation protocals all from the [DomainBed benchmark](https://github.com/facebookresearch/DomainBed). Our work is mainly at the **algorithms.py** files, please refer to them for details.
### Conda & python configration
```sh
#make sure you are now at "domain_generalization/domainbed"
conda create -n LFME python=3.13
conda activate LFME
pip install -r requirements.txt
```
## Quick start

Download the datasets:

Make sure you are now at folder: "domain_generalization"
```sh
# Refer to specific code in this download script, you may download dataset you intend to train with.
#PACS is set to be the only dataset to be downloaded at initial.
python -m domainbed.scripts.download \
       --data_dir=./domainbed/data
```

Train a model:

```sh
python -m domainbed.scripts.train\
       --data_dir=./domainbed/data/PACS/\
       --algorithm LFME\
       --dataset PACS\
       --test_env 0
```


Launch a sweep:

```sh
python -m domainbed.scripts.sweep launch\
       --data_dir=/my/datasets/path\
       --output_dir=/my/sweep/output/path\
       --command_launcher MyLauncher
```

Here, `MyLauncher` is your cluster's command launcher, as implemented in `command_launchers.py`. At the time of writing, the entire sweep trains tens of thousands of models (all algorithms x all datasets x 3 independent trials x 20 random hyper-parameter choices). You can pass arguments to make the sweep smaller:

```sh
python -m domainbed.scripts.sweep launch\
       --data_dir=/my/datasets/path\
       --output_dir=/my/sweep/output/path\
       --command_launcher MyLauncher\
       --algorithms ERM LFME\
       --datasets PACS VLCS\
       --n_hparams 5\
       --n_trials 1
```

After all jobs have either succeeded or failed, you can delete the data from failed jobs with ``python -m domainbed.scripts.sweep delete_incomplete`` and then re-launch them by running ``python -m domainbed.scripts.sweep launch`` again. Specify the same command-line arguments in all calls to `sweep` as you did the first time; this is how the sweep script knows which jobs were launched originally.

To view the results of your sweep:

```sh
python -m domainbed.scripts.collect_results\
       --input_dir=/my/sweep/output/path
```

## Reasoning
If you save your .pkl file to dictionary, .e.g. "domain_generalization/domainbed/train_output/xxxxx.pkl"
```shell
# Make sure you are now at domain_generalization
# To change algorithm or something else, refer to code at domainbed/scripts/demo.py
python -m domainbed.scripts.demo
```
